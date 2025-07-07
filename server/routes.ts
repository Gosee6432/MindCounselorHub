import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, requireAuth, type AuthRequest } from "./auth";
import cookieParser from "cookie-parser";
import { nanoid } from 'nanoid';
import { sendPasswordResetEmail } from "./email";
import { communityComments, psychologyArticles, communityPosts, supervisors } from "@shared/schema";
import { db } from "./db";
import { and, eq } from "drizzle-orm";
import {
  insertSupervisorSchema,
  insertCounselingRecordSchema,
  insertCommunityPostSchema,
  insertCommunityCommentSchema,
  insertReportSchema,
  insertPsychologyArticleSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware
  app.use(cookieParser());

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        role,
        gender,
        phone,
        birthYear,
        education,
        university,
        currentStatus,
        targetCertification,
        counselingExperience,
        interests,
        license,
        licenseNumber,
        association,
        experience,
        specialization,
        therapeuticApproach,
        targetGroups,
        counselingMethods,
        availableHours,
        hourlyRate,
        nationalProgram,
        additionalFee,
        location,
        onlineAvailable,
        introduction,
        careerBackground
      } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 가입된 이메일입니다." });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user with additional fields
      const user = await storage.createUser({
        id: nanoid(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'trainee',
        isActive: true,
        isApproved: role === 'supervisor' ? false : true, // Supervisors need approval
        phone: phone || null,
        gender: gender || null,
        birthYear: birthYear ? parseInt(birthYear) : null,
        education: education || null,
        university: university || null,
        currentStatus: currentStatus || null,
        targetCertification: targetCertification || null,
        counselingExperience: counselingExperience || null,
        interests: interests || null,
        license: license || null,
        licenseNumber: licenseNumber || null,
        association: association || null,
        experience: experience ? parseInt(experience) : null,
        specialization: specialization || null,
        therapeuticApproach: therapeuticApproach || null,
        targetGroups: targetGroups || null,
        counselingMethods: counselingMethods || null,
        availableHours: availableHours || null,
        hourlyRate: hourlyRate || null,
        nationalProgram: nationalProgram || null,
        additionalFee: additionalFee || null,
        location: location || null,
        onlineAvailable: onlineAvailable || null,
        introduction: introduction || null,
        careerBackground: careerBackground || null,
      });

      // If supervisor, create supervisor profile with registration data
      if (user.role === 'supervisor') {
        const supervisorData = {
          userId: user.id,
          name: `${user.firstName}${user.lastName}`,
          gender: gender as "male" | "female" | null,
          affiliation: university || null,
          association: association || null,
          specialization: specialization || null,
          summary: introduction || null,
          contactInfo: email,
          phoneNumber: phone || null,
          clientExperienceFee: hourlyRate ? parseInt(hourlyRate) : 0,
          participatesInNationalProgram: nationalProgram === "참여",
          nationalProgramAdditionalFee: additionalFee ? parseInt(additionalFee) : 0,
          isProfilePublic: true,
          isVisible: false, // 관리자 승인 후 표시
          allowReviews: true,
          approvalStatus: "pending" as const,
          // Map registration data to badge fields
          qualifications: license ? [license] : [],
          targetGroups: user.targetGroups ? (typeof user.targetGroups === 'string' ? user.targetGroups.split(',').map(g => g.trim()) : user.targetGroups) : [],
          concernTypes: user.interests ? (typeof user.interests === 'string' ? user.interests.split(',').map(i => i.trim()) : user.interests) : [],
          counselingMethods: user.counselingMethods ? (typeof user.counselingMethods === 'string' ? user.counselingMethods.split(',').map(m => m.trim()) : user.counselingMethods) : [],
          emotionSymptoms: user.therapeuticApproach ? [user.therapeuticApproach] : [],
          specialExperiences: user.experience ? [`${user.experience}년 경력`] : [],
          counselingRegions: user.location ? [user.location] : [],
          contactMethods: user.onlineAvailable === "가능" ? ["온라인상담", "대면상담"] : ["대면상담"]
        };
        
        await storage.createSupervisor(supervisorData);
      }

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      
      // Set cookie
      res.cookie('auth_token', token, { 
        httpOnly: true, 
        secure: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        message: "회원가입이 완료되었습니다.",
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      console.log('User found:', { email: user.email, hasPasswordHash: !!user.passwordHash });

      // Verify password
      if (!user.passwordHash) {
        console.error('No password hash found for user:', user.email);
        return res.status(400).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      // Check supervisor approval status
      if (user.role === 'supervisor') {
        const supervisor = await storage.getSupervisorByUserId(user.id);
        if (supervisor && supervisor.approvalStatus === 'pending') {
          return res.status(403).json({ 
            message: "승인 대기 중입니다. 관리자 승인 후 로그인이 가능합니다.",
            status: "pending_approval"
          });
        }
      }

      // Generate token
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      
      // Set cookie
      res.cookie('auth_token', token, { 
        httpOnly: true, 
        secure: true, 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ 
        message: "로그인되었습니다.",
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token', { 
      httpOnly: true, 
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
    res.json({ message: "로그아웃되었습니다." });
  });

  app.get('/api/auth/user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "사용자 정보를 가져오는데 실패했습니다." });
    }
  });

  app.put('/api/auth/user/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      if (req.user!.id !== id) {
        return res.status(403).json({ message: "자신의 정보만 수정할 수 있습니다." });
      }

      const updatedUser = await storage.updateUser(id, req.body);
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "사용자 정보 수정에 실패했습니다." });
    }
  });

  // Get supervisor profile for my-page
  app.get('/api/supervisors/my-profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const supervisor = await storage.getSupervisorByUserId(req.user!.id);
      res.json(supervisor);
    } catch (error) {
      console.error("Error fetching supervisor profile:", error);
      res.status(500).json({ message: "수퍼바이저 프로필을 가져오는데 실패했습니다." });
    }
  });

  // Supervisor routes
  app.get('/api/supervisors', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        qualifications: req.query.qualifications ? (req.query.qualifications as string).split(',') : undefined,
        targetGroups: req.query.targetGroups ? (req.query.targetGroups as string).split(',') : undefined,
        concernTypes: req.query.concernTypes ? (req.query.concernTypes as string).split(',') : undefined,
        emotionSymptoms: req.query.emotionSymptoms ? (req.query.emotionSymptoms as string).split(',') : undefined,
        specialExperiences: req.query.specialExperiences ? (req.query.specialExperiences as string).split(',') : undefined,
        counselingMethods: req.query.counselingMethods ? (req.query.counselingMethods as string).split(',') : undefined,
        canProvideClientExperience: req.query.canProvideClientExperience ? req.query.canProvideClientExperience === 'true' : undefined,
        participatesInNationalProgram: req.query.participatesInNationalProgram ? req.query.participatesInNationalProgram === 'true' : undefined,
        noAdditionalFee: req.query.noAdditionalFee ? req.query.noAdditionalFee === 'true' : undefined,
      };

      const allSupervisors = await storage.getSupervisors(filters);
      // Only return visible and approved supervisors for public access
      const visibleSupervisors = allSupervisors.filter(supervisor => 
        supervisor.isVisible !== false && supervisor.approvalStatus === 'approved'
      );
      res.json(visibleSupervisors);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
      res.status(500).json({ message: "Failed to fetch supervisors" });
    }
  });

  app.get('/api/supervisors/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supervisor = await storage.getSupervisor(id);
      
      if (!supervisor) {
        return res.status(404).json({ message: "Supervisor not found" });
      }
      
      res.json(supervisor);
    } catch (error) {
      console.error("Error fetching supervisor:", error);
      res.status(500).json({ message: "Failed to fetch supervisor" });
    }
  });

  app.post('/api/supervisors', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'supervisor') {
        return res.status(403).json({ message: "Only supervisors can create supervisor profiles" });
      }

      const supervisorData = insertSupervisorSchema.parse({
        ...req.body,
        userId,
      });

      const supervisor = await storage.createSupervisor(supervisorData);
      res.json(supervisor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating supervisor:", error);
      res.status(500).json({ message: "Failed to create supervisor" });
    }
  });

  app.put('/api/supervisors/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      console.log("=== SUPERVISOR UPDATE API ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      const supervisor = await storage.getSupervisor(id);
      if (!supervisor) {
        return res.status(404).json({ message: "수퍼바이저를 찾을 수 없습니다" });
      }
      
      if (supervisor.userId !== userId) {
        return res.status(403).json({ message: "권한이 없습니다" });
      }

      // Process the data - keep arrays even if empty, but remove null/undefined
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(([key, value]) => {
          return value !== undefined && value !== null;
        })
      );
      
      console.log("Update data:", JSON.stringify(updateData, null, 2));
      
      // Update supervisor with all provided data
      const updatedSupervisor = await storage.updateSupervisor(id, updateData);
      console.log("✅ Supervisor updated successfully");
      
      res.status(200).json(updatedSupervisor);
    } catch (error) {
      console.error("❌ Error updating supervisor:", error);
      res.status(500).json({ message: "수퍼바이저 수정 중 오류가 발생했습니다" });
    }
  });

  app.get('/api/my-supervisor', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const supervisor = await storage.getSupervisorByUserId(userId);
      res.json(supervisor);
    } catch (error) {
      console.error("Error fetching my supervisor:", error);
      res.status(500).json({ message: "Failed to fetch supervisor profile" });
    }
  });

  // Counseling records routes
  app.get('/api/counseling-records', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const records = await storage.getCounselingRecords(userId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching counseling records:", error);
      res.status(500).json({ message: "Failed to fetch counseling records" });
    }
  });

  app.post('/api/counseling-records', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const recordData = insertCounselingRecordSchema.parse({
        ...req.body,
        userId,
      });

      const record = await storage.createCounselingRecord(recordData);
      res.json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating counseling record:", error);
      res.status(500).json({ message: "Failed to create counseling record" });
    }
  });

  app.put('/api/counseling-records/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const record = await storage.getCounselingRecord(id, userId);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      const recordData = insertCounselingRecordSchema.partial().parse(req.body);
      const updatedRecord = await storage.updateCounselingRecord(id, recordData);
      res.json(updatedRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating counseling record:", error);
      res.status(500).json({ message: "Failed to update counseling record" });
    }
  });

  app.delete('/api/counseling-records/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      await storage.deleteCounselingRecord(id, userId);
      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      console.error("Error deleting counseling record:", error);
      res.status(500).json({ message: "Failed to delete counseling record" });
    }
  });

  // Community routes
  app.get('/api/community/posts', async (req, res) => {
    try {
      const { search, category } = req.query;
      const filters = {
        search: search as string,
        category: category as string
      };
      const posts = await storage.getCommunityPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', async (req: any, res) => {
    try {
      // Generate anonymous user ID for truly anonymous posting
      const userId = req.user?.claims?.sub || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const { title, content, category } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      const post = await storage.createCommunityPost({
        title,
        content,
        category,
        userId,
      });
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.post('/api/community/posts/:id/like', async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      // Get real client IP, accounting for proxies
      const ipAddress = req.headers['x-forwarded-for'] || 
                       req.headers['x-real-ip'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress || 
                       (req.connection.socket ? req.connection.socket.remoteAddress : null) || 
                       'unknown';
      
      // Use first IP if x-forwarded-for contains multiple IPs
      const clientIP = typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : 'unknown';
      console.log('Like request IP:', clientIP);
      const result = await storage.likeCommunityPost(postId, clientIP);
      
      res.json({ message: result.message });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.get('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommunityComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }

      const { nickname, password, content, parentId } = req.body;
      if (!nickname || !password || !content) {
        return res.status(400).json({ message: "Nickname, password and content are required" });
      }

      let comment;
      if (parentId) {
        // Creating a reply
        comment = await storage.createCommentReply({
          postId,
          parentId: parseInt(parentId),
          content,
          anonymousNickname: nickname,
          password, // Store password for edit/delete
          userId: "anonymous",
        });
      } else {
        // Creating a top-level comment
        comment = await storage.createCommunityComment({
          postId,
          content,
          anonymousNickname: nickname,
          password, // Store password for edit/delete
          userId: "anonymous",
        });
      }

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Edit comment
  app.put('/api/community/comments/:id', async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { nickname, password, content } = req.body;
      
      if (!nickname || !password || !content) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const comment = await storage.editCommunityComment(commentId, {
        nickname,
        password,
        content
      });

      res.json(comment);
    } catch (error) {
      console.error("Error editing comment:", error);
      if (error.message === "Invalid password") {
        res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      } else {
        res.status(500).json({ message: "Failed to edit comment" });
      }
    }
  });

  // Delete comment
  app.delete('/api/community/comments/:id', async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      await storage.deleteCommunityComment(commentId, password);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      if (error.message === "Invalid password") {
        res.status(401).json({ message: "비밀번호가 일치하지 않습니다" });
      } else {
        res.status(500).json({ message: "Failed to delete comment" });
      }
    }
  });

  // Get comment replies
  app.get('/api/community/comments/:id/replies', async (req, res) => {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }

      const replies = await db
        .select()
        .from(communityComments)
        .where(and(
          eq(communityComments.parentId, commentId),
          eq(communityComments.isBlinded, false)
        ))
        .orderBy(communityComments.createdAt);

      res.json(replies);
    } catch (error) {
      console.error("Error fetching replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  // Report routes
  app.post('/api/reports', requireAuth, async (req: AuthRequest, res) => {
    try {
      const reporterId = req.user!.id;
      const reportData = insertReportSchema.parse({
        ...req.body,
        reporterId,
      });

      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Admin: Update report status
  app.put('/api/admin/reports/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const reportId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(reportId)) {
        return res.status(400).json({ message: "Invalid report ID" });
      }
      
      if (!['pending', 'reviewed', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const report = await storage.updateReportStatus(reportId, status);
      res.json(report);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Failed to update report status" });
    }
  });

  // Education posts routes
  app.get('/api/education/posts', async (req, res) => {
    try {
      const { search, category } = req.query;
      const posts = await storage.getEducationPosts({
        search: search as string,
        category: category as string
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching education posts:", error);
      res.status(500).json({ message: "Failed to fetch education posts" });
    }
  });

  app.post('/api/education/posts', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const postData = req.body;
      const post = await storage.createEducationPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating education post:", error);
      res.status(500).json({ message: "Failed to create education post" });
    }
  });

  app.put('/api/education/posts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const postId = parseInt(req.params.id);
      const postData = req.body;
      const post = await storage.updateEducationPost(postId, postData);
      res.json(post);
    } catch (error) {
      console.error("Error updating education post:", error);
      res.status(500).json({ message: "Failed to update education post" });
    }
  });

  app.delete('/api/education/posts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const postId = parseInt(req.params.id);
      await storage.deleteEducationPost(postId);
      res.json({ message: "Education post deleted successfully" });
    } catch (error) {
      console.error("Error deleting education post:", error);
      res.status(500).json({ message: "Failed to delete education post" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/reports', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.put('/api/admin/reports/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const updatedReport = await storage.updateReportStatus(id, status);
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "Failed to update report" });
    }
  });

  // Admin: Get pending supervisors
  app.get('/api/admin/pending-supervisors', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const pendingSupervisors = await storage.getPendingSupervisors();
      res.json(pendingSupervisors);
    } catch (error) {
      console.error("Error fetching pending supervisors:", error);
      res.status(500).json({ message: "Failed to fetch pending supervisors" });
    }
  });

  // Admin: Get all supervisors
  app.get('/api/admin/all-supervisors', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const allSupervisors = await db.select().from(supervisors);
      res.json(allSupervisors);
    } catch (error) {
      console.error("Error fetching all supervisors:", error);
      res.status(500).json({ message: "Failed to fetch all supervisors" });
    }
  });

  // Admin: Approve supervisor
  app.put('/api/admin/supervisors/:id/approve', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        console.log("Access denied - user role:", req.user?.role);
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const supervisorId = parseInt(req.params.id);
      console.log("Approving supervisor with ID:", supervisorId);
      
      if (isNaN(supervisorId)) {
        console.log("Invalid supervisor ID:", req.params.id);
        return res.status(400).json({ message: "Invalid supervisor ID" });
      }
      
      const supervisor = await storage.approveSupervisor(supervisorId);
      console.log("Supervisor approved successfully:", supervisor);
      res.json(supervisor);
    } catch (error) {
      console.error("Error approving supervisor:", error);
      res.status(500).json({ message: "수퍼바이저 승인 중 오류가 발생했습니다." });
    }
  });

  app.put('/api/admin/supervisors/:id/visibility', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }

      const supervisorId = parseInt(req.params.id);
      const { isVisible } = req.body;

      const supervisor = await storage.toggleSupervisorProfileVisibility(supervisorId, isVisible);
      res.json(supervisor);
    } catch (error) {
      console.error("Error updating supervisor visibility:", error);
      res.status(500).json({ message: "Failed to update supervisor visibility" });
    }
  });

  // Admin: Delete community post
  app.delete('/api/community/posts/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const postId = parseInt(req.params.id);
      await db.delete(communityPosts).where(eq(communityPosts.id, postId));
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Admin: Delete psychology article
  app.delete('/api/psychology/articles/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const articleId = parseInt(req.params.id);
      await db.delete(psychologyArticles).where(eq(psychologyArticles.id, articleId));
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Admin: Pin/Unpin community post
  app.put('/api/admin/posts/:id/pin', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const postId = parseInt(req.params.id);
      const { isPinned } = req.body;
      
      const [updatedPost] = await db
        .update(communityPosts)
        .set({ 
          isPinned,
          updatedAt: new Date() 
        })
        .where(eq(communityPosts.id, postId))
        .returning();
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post pin status:", error);
      res.status(500).json({ message: "Failed to update post pin status" });
    }
  });

  // Admin: Create psychology article
  app.post('/api/admin/psychology/articles', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "관리자 권한이 필요합니다." });
      }
      
      const articleData = insertPsychologyArticleSchema.parse(req.body);
      
      const [newArticle] = await db
        .insert(psychologyArticles)
        .values(articleData)
        .returning();
      
      res.json(newArticle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating psychology article:", error);
      res.status(500).json({ message: "Failed to create psychology article" });
    }
  });

  // Generate new psychology articles using Perplexity API
  app.post('/api/psychology/articles/generate', async (req, res) => {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "당신은 심리학 전문가입니다. 최신 심리학 연구, 치료법, 상담 기법에 대한 정확하고 신뢰할 수 있는 정보를 제공해주세요."
            },
            {
              role: "user",
              content: "한국의 심리상담 수련생들을 위한 최신 심리학 정보 10개를 생성해주세요. 다음 형식의 JSON 배열로 답변해주세요:\n\n[{\"title\": \"제목\", \"summary\": \"100자 이내 요약\", \"content\": \"500자 이상 상세 설명\", \"category\": \"연구동향/치료법/상담기법/일반 중 하나\"}, ...]\n\n다양한 주제들을 포함해주세요:\n1. 마음챙김 기반 치료(MBCT) 최신 연구\n2. 가족치료와 시스템 접근법\n3. 성격장애 치료와 DBT 기법\n4. 온라인 상담 윤리와 가이드라인\n5. 문화적 다양성을 고려한 상담법\n6. 애착 이론의 현대적 적용\n7. 신경피드백과 바이오피드백 치료\n8. 해결중심 단기치료(SFBT) 기법\n9. 집단치료의 최신 동향\n10. 상담자 소진 예방과 관리\n\n각 내용은 한국어로 작성하고, 실제 연구 데이터와 사례를 포함해주세요."
            }
          ],
          max_tokens: 4000,
          temperature: 0.2,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from Perplexity API");
      }

      let newArticles;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          newArticles = JSON.parse(jsonMatch[0]);
        } else {
          newArticles = JSON.parse(content);
        }
      } catch (parseError) {
        const sections = content.split(/\d+\./);
        newArticles = sections.slice(1, 11).map((section: any, index: any) => {
          const lines = section.trim().split('\n');
          const title = lines[0]?.trim() || `심리학 연구 ${index + 6}`;
          const contentText = lines.slice(1).join('\n').trim() || section.trim();
          
          const categories = ["연구동향", "치료법", "상담기법", "일반"];
          const category = categories[index % categories.length];
          
          return {
            id: index + 6,
            title: title.length > 100 ? title.substring(0, 100) + "..." : title,
            summary: contentText.substring(0, 100) + "...",
            content: contentText,
            category: category,
            author: "Perplexity AI",
            publishedAt: new Date().toISOString(),
            readTime: "5분"
          };
        });
      }

      if (Array.isArray(newArticles)) {
        newArticles = newArticles.map((article, index) => ({
          ...article,
          id: index + 6,
          author: article.author || "Perplexity AI",
          publishedAt: article.publishedAt || new Date().toISOString(),
          readTime: article.readTime || "5분"
        }));
      }

      res.json(newArticles || []);
    } catch (error) {
      console.error("Error adding more psychology articles:", error);
      res.status(500).json({ message: "Failed to add more psychology articles" });
    }
  });

  // Psychology articles routes - now using database instead of cache
  app.get('/api/psychology/articles', async (req, res) => {
    try {
      const articles = await db.select().from(psychologyArticles).orderBy(psychologyArticles.publishedAt);
      
      // If no articles exist, generate initial articles using Perplexity API
      if (articles.length === 0) {
        await generateInitialArticles();
        const newArticles = await db.select().from(psychologyArticles).orderBy(psychologyArticles.publishedAt);
        return res.json(newArticles);
      }
      
      res.json(articles);
    } catch (error) {
      console.error("Error fetching psychology articles:", error);
      res.status(500).json({ message: "Failed to fetch psychology articles" });
    }
  });

  app.get('/api/psychology/articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid article ID" });
      }

      const [article] = await db
        .select()
        .from(psychologyArticles)
        .where(eq(psychologyArticles.id, id));

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      res.json(article);
    } catch (error) {
      console.error("Error fetching psychology article:", error);
      res.status(500).json({ message: "Failed to fetch psychology article" });
    }
  });

  // Daily article generation scheduler
  let dailyArticleScheduler: NodeJS.Timeout | null = null;

  async function generateDailyArticle() {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "당신은 한국의 임상심리학 박사이자 수퍼바이저입니다. 심리상담 수련생들을 위한 전문적이고 실용적인 최신 심리학 정보를 제공합니다. 학술적 근거와 실무 적용 방법을 모두 포함하여 작성해주세요."
            },
            {
              role: "user",
              content: "한국의 심리상담 수련생들을 위한 고도화된 전문 심리학 아티클 1개를 JSON 형식으로 생성해주세요.\n\n형식:\n{\"title\": \"구체적이고 전문적인 제목\", \"summary\": \"핵심 내용 요약 (200자)\", \"content\": \"상세 내용 (3000자 이상)\", \"category\": \"신경심리학/인지행동치료/트라우마치료/성격장애/문화심리학/애착이론/수용전념치료/변증법적행동치료/집단상담/가족치료\", \"readTime\": \"예상 읽기시간\"}\n\n고도화된 내용 요구사항:\n- 최신 5년간 연구 결과와 메타분석 포함\n- 신경생물학적/인지과학적 근거 제시\n- 고급 치료 프로토콜과 세부 기법\n- 한국 문화적 특수성과 집단주의 문화 고려\n- 수퍼비전 및 교육 가이드라인\n- 윤리적 딜레마와 전문가 책임\n- 구체적 사례와 연구 데이터\n- 미래 전망과 발전 방향\n\n고급 주제 예시: 신경과학 기반 CBT, 복합 트라우마 PTSD 치료, 경계선 성격장애 DBT, 가족 시스템 이론, 현대 정신분석, 온라인 집단상담, 신경다양성 치료, 애착 기반 놀이치료, 게슈탈트와 마음챙김, EMDR 3세대, ACT/DBT/MBCT 통합, 문화적 적응 치료"
            }
          ],
          max_tokens: 4000,
          temperature: 0.6,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        console.error(`Perplexity API error: ${response.status}`);
        return;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.log("No content from Perplexity API for daily article");
        return;
      }

      let article;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          article = JSON.parse(jsonMatch[0]);
        } else {
          article = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Failed to parse Perplexity response for daily article");
        return;
      }

      if (article && typeof article === 'object') {
        await db.insert(psychologyArticles).values({
          title: article.title || "오늘의 심리학 이야기",
          summary: article.summary || "심리학 연구 요약",
          content: article.content || "상세 내용을 준비 중입니다.",
          category: article.category || "일반",
          readTime: article.readTime || "5분",
        });
        console.log(`Generated daily psychology article: ${article.title}`);
      }
    } catch (error) {
      console.error("Error generating daily psychology article:", error);
    }
  }

  // Start daily article generation (every 24 hours)
  function startDailyArticleGeneration() {
    // Generate high-quality articles immediately if database is empty
    db.select().from(psychologyArticles).limit(1).then(articles => {
      if (articles.length === 0) {
        generateInitialArticles();
      }
    });

    // Schedule daily generation at 9 AM KST
    const now = new Date();
    const tomorrow9AM = new Date();
    tomorrow9AM.setDate(now.getDate() + 1);
    tomorrow9AM.setHours(9, 0, 0, 0);
    
    const timeUntilNext = tomorrow9AM.getTime() - now.getTime();
    
    setTimeout(() => {
      generateDailyArticle();
      // Then schedule every 24 hours
      dailyArticleScheduler = setInterval(generateDailyArticle, 24 * 60 * 60 * 1000);
    }, timeUntilNext);
    
    console.log(`Daily article generation scheduled. Next article at ${tomorrow9AM.toLocaleString('ko-KR')}`);
  }

  // Start the daily article generation
  startDailyArticleGeneration();

  // Generate initial articles using Perplexity API
  async function generateInitialArticles() {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system", 
              content: "당신은 한국의 임상심리학 박사이자 수퍼바이저입니다. 심리상담 수련생들을 위한 전문적이고 실용적인 최신 심리학 정보를 제공합니다."
            },
            {
              role: "user",
              content: "한국의 심리상담 수련생들을 위한 고품질 심리학 아티클 12개를 JSON 배열 형식으로 생성해주세요.\n\n형식: [{\"title\": \"전문적 제목\", \"summary\": \"핵심 요약 (150자)\", \"content\": \"상세 내용 (2000자 이상)\", \"category\": \"연구동향/치료법/상담기법/일반\", \"author\": \"전문가명 박사\", \"readTime\": \"읽기시간\"}]\n\n각 아티클 요구사항:\n- 최신 연구나 이론 포함\n- 실무 적용 가능한 구체적 기법\n- 한국 상담 현실 반영\n- 실제 사례나 예시 포함\n- 추가 학습 방향 제시\n\n주제: CBT 3세대 기법, DBT 감정조절, EMDR 최신 프로토콜, ACT 수용전념치료, 마음챙김 기반 개입, 애착외상 치료, 성격장애 통합치료, 집단치료 역동, 온라인 상담 기법, 상담자 소진 관리, 가족체계 치료, 해결중심 기법 등"
            }
          ],
          max_tokens: 12000,
          temperature: 0.3,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.log("No content from Perplexity API, using fallback articles");
        return;
      }

      let articles;
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          articles = JSON.parse(jsonMatch[0]);
        } else {
          articles = JSON.parse(content);
        }
      } catch (parseError) {
        console.error("Failed to parse Perplexity response, using fallback");
        return;
      }

      if (Array.isArray(articles)) {
        for (const article of articles) {
          await db.insert(psychologyArticles).values({
            title: article.title || "심리학 연구",
            summary: article.summary || "심리학 연구 요약",
            content: article.content || "상세 내용을 준비 중입니다.",
            category: article.category || "일반",

            readTime: article.readTime || "5분",
          });
        }
        console.log(`Generated ${articles.length} psychology articles`);
      }
    } catch (error) {
      console.error("Error generating psychology articles:", error);
    }
  }

  // Original cached data as fallback - keeping for reference
  let fallbackPsychologyArticles = [
    {
      id: 1,
      title: "최신 CBT 연구 동향",
      summary: "인지행동치료의 최신 연구 결과와 효과성에 대한 메타분석 연구",
      content: "최근 발표된 인지행동치료(CBT) 메타분석 연구에 따르면, CBT는 우울증, 불안장애, PTSD 등 다양한 정신건강 문제에서 높은 효과성을 보이고 있습니다. 특히 온라인 CBT의 경우 대면 치료와 유사한 효과를 나타내며, 접근성 측면에서 큰 장점을 가지고 있습니다. 한국 내 연구에서도 문화적 맥락을 고려한 CBT 프로토콜이 개발되어 한국인의 정서적 특성에 맞는 치료법이 제시되고 있습니다. 최신 연구에서는 CBT와 마음챙김 기법을 결합한 통합적 접근이 치료 효과를 더욱 향상시키는 것으로 나타났습니다.",
      category: "연구동향",
      author: "한국상담심리학회",
      publishedAt: "2024-12-01T00:00:00Z",
      readTime: "5분"
    },
    {
      id: 2,
      title: "디지털 치료법의 발전",
      summary: "VR, AR, AI를 활용한 새로운 심리치료 기법들의 임상 적용 현황",
      content: "가상현실(VR)과 증강현실(AR), 인공지능(AI)을 활용한 디지털 치료법이 급속도로 발전하고 있습니다. VR 노출치료는 공포증과 PTSD 치료에서 기존 치료법 대비 30% 높은 효과를 보이고 있으며, AI 챗봇을 활용한 인지행동치료는 24시간 접근 가능한 치료 환경을 제공합니다. 한국에서도 K-VR 치료 프로그램이 개발되어 임상 현장에서 활용되고 있습니다. 최근에는 바이오피드백과 결합된 VR 치료가 불안장애 치료에 새로운 가능성을 제시하고 있습니다.",
      category: "치료법",
      author: "한국디지털헬스케어학회",
      publishedAt: "2024-11-28T00:00:00Z",
      readTime: "6분"
    },
    {
      id: 3,
      title: "트라우마 치료의 새로운 접근법",
      summary: "EMDR과 체감 중심 치료법의 효과성과 한국적 적용 방안",
      content: "트라우마 치료 분야에서 EMDR(안구운동 둔감화 및 재처리 요법)과 체감 중심 치료법이 주목받고 있습니다. EMDR은 외상 후 스트레스 장애(PTSD) 치료에서 80% 이상의 개선율을 보이며, 특히 복합 트라우마 치료에 효과적입니다. 한국에서는 문화적 특성을 고려한 K-EMDR 프로토콜이 개발되어 내담자의 회복 과정을 지원하고 있습니다. 또한 몸과 마음의 연결을 중시하는 체감 중심 치료법이 전통적인 인지치료와 결합되어 새로운 치료 패러다임을 제시하고 있습니다.",
      category: "치료법",
      author: "한국트라우마스트레스학회",
      publishedAt: "2024-11-25T00:00:00Z",
      readTime: "7분"
    },
    {
      id: 4,
      title: "청소년 정신건강 연구",
      summary: "팬데믹 이후 청소년 우울증과 불안증의 증가 현황과 대응 방안",
      content: "코로나19 팬데믹 이후 청소년 정신건강 문제가 급격히 증가하고 있습니다. 최근 연구에 따르면 청소년 우울증은 팬데믹 이전 대비 40% 증가했으며, 불안장애도 35% 증가한 것으로 나타났습니다. 특히 디지털 네이티브 세대의 특성을 반영한 새로운 치료 접근법이 필요합니다. 한국에서는 학교 기반 정신건강 프로그램과 온라인 상담 플랫폼을 통해 청소년들에게 접근하는 혁신적인 방법들이 시도되고 있습니다. 게임 기반 치료와 SNS를 활용한 조기 개입 프로그램이 특히 주목받고 있습니다.",
      category: "연구동향",
      author: "한국청소년상담학회",
      publishedAt: "2024-11-22T00:00:00Z",
      readTime: "6분"
    },
    {
      id: 5,
      title: "AI와 심리상담의 융합",
      summary: "인공지능 기술이 심리상담 분야에 미치는 영향과 윤리적 고려사항",
      content: "인공지능 기술이 심리상담 분야에 혁신을 가져오고 있습니다. AI 기반 감정 분석 시스템은 내담자의 미세한 감정 변화를 실시간으로 감지하여 상담사에게 유용한 정보를 제공합니다. 자연어 처리 기술을 활용한 상담 기록 분석은 치료 과정의 패턴을 파악하고 개인화된 치료 계획 수립에 도움을 줍니다. 그러나 AI 상담의 한계와 윤리적 문제도 동시에 제기되고 있어, 인간 상담사와 AI의 협력적 관계 구축이 중요한 과제로 대두되고 있습니다. 한국에서는 AI 윤리 가이드라인을 바탕으로 안전하고 효과적인 AI 상담 시스템 구축을 위한 연구가 활발히 진행되고 있습니다.",
      category: "연구동향",
      author: "한국AI상담연구소",
      publishedAt: "2024-11-20T00:00:00Z",
      readTime: "8분"
    },
    {
      id: 6,
      title: "마음챙김 기반 치료(MBCT) 최신 연구",
      summary: "MBCT가 재발성 우울증과 불안장애 치료에 미치는 긍정적 영향",
      content: "마음챙김 기반 인지치료(MBCT)는 재발성 우울증 예방에 특히 효과적인 것으로 나타났습니다. 8주간의 MBCT 프로그램을 통해 환자들의 우울증 재발률이 43% 감소했으며, 불안 수준도 유의미하게 개선되었습니다. 최신 뇌 영상 연구에서는 MBCT가 편도체와 전전두엽 간의 연결성을 향상시켜 감정 조절 능력을 강화하는 것으로 밝혀졌습니다. 한국에서도 K-MBCT 프로그램이 개발되어 한국인의 문화적 특성을 반영한 치료법이 적용되고 있으며, 특히 직장인 스트레스 관리와 학생 시험 불안 완화에 효과적인 것으로 입증되었습니다.",
      category: "치료법",
      author: "한국마음챙김학회",
      publishedAt: "2024-11-18T00:00:00Z",
      readTime: "6분"
    },
    {
      id: 7,
      title: "가족치료와 시스템 접근법",
      summary: "현대 가족의 변화에 따른 새로운 가족치료 모델과 접근 방식",
      content: "현대 사회의 가족 구조 변화에 따라 가족치료 접근법도 진화하고 있습니다. 한부모 가족, 재혼 가족, 다문화 가족 등 다양한 가족 형태에 맞는 맞춤형 치료 모델이 개발되고 있습니다. 시스템 이론에 기반한 가족치료는 개인의 문제를 가족 전체의 역동으로 이해하고 접근합니다. 최근에는 온라인 가족치료와 가상현실을 활용한 가족 상호작용 훈련이 주목받고 있습니다. 한국의 경우 효문화와 집단주의적 특성을 고려한 K-패밀리 테라피 모델이 개발되어 높은 치료 효과를 보이고 있습니다. 특히 청소년 문제행동과 부부갈등 해결에 효과적인 것으로 나타났습니다.",
      category: "치료법",
      author: "한국가족치료학회",
      publishedAt: "2024-11-15T00:00:00Z",
      readTime: "7분"
    },
    {
      id: 8,
      title: "성격장애 치료와 DBT 기법",
      summary: "변증법적 행동치료(DBT)의 성격장애 치료 효과와 한국적 적용",
      content: "변증법적 행동치료(DBT)는 경계성 성격장애를 비롯한 다양한 성격장애 치료에 혁신적인 접근법을 제시하고 있습니다. DBT의 핵심 기법인 마음챙김, 고통감내, 감정조절, 대인관계 효율성 모듈이 통합적으로 적용되어 치료 효과를 극대화합니다. 최근 연구에서는 DBT가 자해 행동을 77% 감소시키고 입원율을 50% 줄이는 것으로 나타났습니다. 한국에서는 문화적 맥락을 고려한 K-DBT 프로토콜이 개발되어 한국인의 정서적 특성에 맞는 치료법이 제공되고 있습니다. 특히 집단치료 형태의 DBT 기술훈련이 개인치료와 결합되어 높은 치료 성과를 보이고 있습니다.",
      category: "치료법",
      author: "한국DBT연구회",
      publishedAt: "2024-11-12T00:00:00Z",
      readTime: "8분"
    },
    {
      id: 9,
      title: "온라인 상담 윤리와 가이드라인",
      summary: "디지털 시대 온라인 심리상담의 윤리적 기준과 실무 지침",
      content: "팬데믹 이후 온라인 상담이 급속히 확산되면서 새로운 윤리적 기준과 실무 지침의 필요성이 대두되었습니다. 온라인 상담의 기밀성, 안전성, 효과성을 보장하기 위한 체계적인 가이드라인이 수립되고 있습니다. 특히 화상 상담 시 개인정보 보호, 응급상황 대응 프로토콜, 기술적 문제 해결 방안 등이 중요한 이슈로 다뤄지고 있습니다. 한국상담심리학회에서는 'K-텔레헬스 상담 윤리 가이드라인'을 제정하여 안전하고 효과적인 온라인 상담 서비스 제공을 위한 표준을 제시하고 있습니다. 또한 상담사 교육과 자격 인증 시스템도 온라인 환경에 맞게 개편되고 있습니다.",
      category: "상담기법",
      author: "한국상담윤리위원회",
      publishedAt: "2024-11-10T00:00:00Z",
      readTime: "6분"
    },
    {
      id: 10,
      title: "문화적 다양성을 고려한 상담법",
      summary: "다문화 사회에서의 문화 적응적 상담 접근법과 실제 적용 사례",
      content: "한국 사회의 다문화화가 진행되면서 문화적 다양성을 고려한 상담 접근법의 중요성이 증대되고 있습니다. 다문화 상담에서는 내담자의 문화적 배경, 언어적 특성, 종교적 신념 등을 종합적으로 고려해야 합니다. 문화 적응적 상담 모델은 서구의 상담 이론을 단순히 적용하는 것이 아니라, 각 문화의 고유한 치유 방식을 통합하는 접근법입니다. 한국에서는 결혼이주여성, 외국인 근로자, 다문화 가정 자녀를 위한 전문 상담 프로그램이 개발되어 운영되고 있습니다. 특히 언어 장벽을 극복하기 위한 통역 상담과 문화 중재자를 활용한 상담 모델이 효과적인 것으로 나타나고 있습니다.",
      category: "상담기법",
      author: "한국다문화상담학회",
      publishedAt: "2024-11-08T00:00:00Z",
      readTime: "7분"
    },
    {
      id: 11,
      title: "애착 이론의 현대적 적용",
      summary: "성인 애착 유형과 치료적 관계에서의 애착 기반 개입 방법",
      content: "애착 이론이 성인 심리치료 분야에서 새롭게 조명받고 있습니다. 성인 애착 유형(안정형, 회피형, 불안형, 혼란형)에 따른 맞춤형 치료 접근이 개발되어 치료 효과를 향상시키고 있습니다. 특히 치료적 관계에서 안전한 애착 관계를 형성하는 것이 치료 성과의 핵심 요소로 인식되고 있습니다. 최신 연구에서는 불안정 애착이 우울증, 불안장애, 성격장애 등과 밀접한 관련이 있음이 밝혀졌습니다. 한국에서는 동양적 가족 관계의 특성을 반영한 애착 기반 치료 모델이 개발되어 부모-자녀 관계 개선과 커플 치료에 활용되고 있습니다. 특히 정서 초점 치료(EFT)와 결합된 애착 기반 접근이 높은 치료 효과를 보이고 있습니다.",
      category: "치료법",
      author: "한국애착연구소",
      publishedAt: "2024-11-05T00:00:00Z",
      readTime: "7분"
    },
    {
      id: 12,
      title: "신경피드백과 바이오피드백 치료",
      summary: "뇌파 조절과 생체신호 모니터링을 통한 혁신적인 치료 접근법",
      content: "신경피드백과 바이오피드백 치료가 정신건강 분야에서 주목받는 치료법으로 떠오르고 있습니다. 뇌파(EEG) 분석을 통한 신경피드백은 ADHD, 불안장애, 우울증 치료에 효과적인 것으로 입증되었습니다. 특히 약물치료에 반응하지 않는 경우나 부작용을 우려하는 환자들에게 대안적 치료법으로 활용되고 있습니다. 바이오피드백은 심박변이도, 근전도, 피부온도 등 생체신호를 실시간으로 모니터링하여 스트레스 관리와 이완 훈련에 도움을 줍니다. 한국에서도 첨단 기술을 활용한 뉴로피드백 센터들이 증가하고 있으며, VR과 결합된 바이오피드백 시스템이 개발되어 치료 효과를 극대화하고 있습니다.",
      category: "치료법",
      author: "한국신경피드백학회",
      publishedAt: "2024-11-02T00:00:00Z",
      readTime: "6분"
    },
    {
      id: 13,
      title: "해결중심 단기치료(SFBT) 기법",
      summary: "문제보다 해결책에 초점을 둔 효율적인 단기 치료 모델의 활용",
      content: "해결중심 단기치료(SFBT)는 문제의 원인보다 해결책에 초점을 두는 효율적인 치료 접근법입니다. 평균 3-5회기의 짧은 치료 기간 동안 내담자의 강점과 자원을 활용하여 구체적인 변화를 이끌어냅니다. 기적질문, 척도질문, 예외질문 등의 핵심 기법을 통해 내담자가 원하는 미래를 구체화하고 달성 가능한 목표를 설정합니다. 최근 연구에서는 SFBT가 청소년 문제행동, 부부갈등, 직장 스트레스 등 다양한 영역에서 80% 이상의 개선율을 보이는 것으로 나타났습니다. 한국에서는 학교상담과 직장 내 상담에서 SFBT의 활용도가 높아지고 있으며, 단시간 내 실질적 변화를 추구하는 한국인의 성향과 잘 맞는 치료법으로 평가받고 있습니다.",
      category: "상담기법",
      author: "한국SFBT연구회",
      publishedAt: "2024-10-30T00:00:00Z",
      readTime: "5분"
    },
    {
      id: 14,
      title: "집단치료의 최신 동향",
      summary: "코로나19 이후 변화하는 집단치료 환경과 온라인 집단상담의 발전",
      content: "집단치료가 팬데믹 이후 새로운 전환점을 맞고 있습니다. 온라인 집단상담의 도입으로 지리적 제약 없이 다양한 참여자들이 모일 수 있게 되었고, 하이브리드 형태의 집단상담도 활발히 시도되고 있습니다. 집단치료의 핵심 치료 요인인 보편성, 희망 고취, 대인학습 등이 온라인 환경에서도 효과적으로 작동함이 입증되었습니다. 특히 사회불안장애, 우울증, 중독 문제를 다루는 집단치료에서 높은 효과를 보이고 있습니다. 한국에서는 문화적 특성을 반영한 K-집단치료 모델이 개발되어 집단 응집력과 치료 효과를 향상시키고 있습니다. 또한 특정 주제별 집단(트라우마, 애도, 스트레스 관리 등)이 세분화되어 전문적인 집단치료 서비스가 제공되고 있습니다.",
      category: "치료법",
      author: "한국집단치료학회",
      publishedAt: "2024-10-28T00:00:00Z",
      readTime: "7분"
    },
    {
      id: 15,
      title: "상담자 소진 예방과 관리",
      summary: "상담사의 정신건강 보호를 위한 체계적인 소진 예방 및 관리 전략",
      content: "상담사의 소진(burnout) 문제가 심리상담 분야의 중요한 이슈로 대두되고 있습니다. 높은 업무 강도, 감정적 부담, 경제적 불안정 등이 상담사 소진의 주요 원인으로 지적되고 있습니다. 소진은 개인적 성취감 감소, 비인격화, 정서적 고갈로 나타나며, 결국 치료 질 저하로 이어질 수 있습니다. 예방을 위해서는 체계적인 수퍼비전, 정기적인 자기 관리, 동료 지지 체계 구축이 필수적입니다. 한국에서는 상담사 웰빙 프로그램과 소진 예방 교육이 확대되고 있으며, 상담사를 위한 상담사 제도도 운영되고 있습니다. 또한 마음챙김 기반 자기돌봄 프로그램과 스트레스 관리 워크숍이 정기적으로 실시되어 상담사들의 정신건강 유지에 도움을 주고 있습니다.",
      category: "일반",
      author: "한국상담사협회",
      publishedAt: "2024-10-25T00:00:00Z",
      readTime: "8분"
    }
  ];

  // Psychology articles routes  
  app.get("/api/psychology/articles", async (req, res) => {
    try {
      // Return cached data immediately for fast loading
      res.json(cachedPsychologyArticles);
    } catch (error) {
      console.error("Error fetching psychology articles:", error);
      res.status(500).json({ 
        message: "Failed to fetch psychology articles",
        error: error.message 
      });
    }
  });

  // Add new psychology articles using Perplexity API
  app.post("/api/psychology/articles/generate", async (req, res) => {
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "당신은 심리학 전문가입니다. 최신 심리학 연구, 치료법, 상담 기법에 대한 정확하고 신뢰할 수 있는 정보를 제공해주세요."
            },
            {
              role: "user", 
              content: "한국의 심리상담 수련생들을 위한 최신 심리학 정보 5개를 생성해주세요. 다음 형식의 JSON 배열로 답변해주세요: [{\"title\": \"제목\", \"summary\": \"100자 이내 요약\", \"content\": \"500자 이상 상세 설명\", \"category\": \"연구동향/치료법/상담기법/일반 중 하나\"}, ...]. 실제 연구와 데이터를 바탕으로 정확한 정보를 제공해주세요."
            }
          ],
          max_tokens: 3000,
          temperature: 0.2,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from Perplexity API");
      }

      let newArticles = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          newArticles = JSON.parse(jsonMatch[0]);
        } else {
          newArticles = JSON.parse(content);
        }
      } catch (parseError) {
        res.status(500).json({ message: "Failed to parse generated content" });
        return;
      }

      // Format and add to cache
      const formattedArticles = newArticles.map((article, index) => ({
        id: cachedPsychologyArticles.length + index + 1,
        title: article.title || `심리학 연구 ${index + 1}`,
        summary: article.summary || article.content?.substring(0, 100) + "...",
        content: article.content || "내용을 불러오는 중입니다.",
        category: article.category || "일반",
        author: "Perplexity AI",
        publishedAt: new Date().toISOString(),
        readTime: "5분"
      }));

      // Add to cached articles
      cachedPsychologyArticles = [...cachedPsychologyArticles, ...formattedArticles];
      
      res.json(formattedArticles);
    } catch (error) {
      console.error("Error generating psychology articles:", error);
      res.status(500).json({ 
        message: "Failed to generate psychology articles",
        error: error.message 
      });
    }
  });

  app.get("/api/psychology/articles/:id", async (req, res) => {
    try {
      const articleId = req.params.id;
      
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: "당신은 심리학 전문가입니다. 요청받은 주제에 대해 상세하고 신뢰할 수 있는 정보를 제공해주세요. 응답은 한국어로 작성해주세요."
            },
            {
              role: "user",
              content: `심리학 아티클 ID ${articleId}에 해당하는 주제에 대해 상세한 정보를 제공해주세요. 최신 연구 결과, 실제 적용 사례, 전문가 의견을 포함해서 1000자 이상의 상세한 내용을 작성해주세요.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.2,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content received from Perplexity API");
      }

      const article = {
        id: parseInt(articleId),
        title: `심리학 연구 분석 ${articleId}`,
        summary: content.substring(0, 200) + "...",
        content: content,
        category: "상세분석",
        author: "Perplexity AI",
        publishedAt: new Date().toISOString(),
        readTime: "8분"
      };

      res.json(article);
    } catch (error) {
      console.error("Error fetching psychology article:", error);
      res.status(500).json({ 
        message: "Failed to fetch psychology article",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Password reset routes
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: '이메일을 입력해주세요.' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // 보안상 이메일이 존재하지 않아도 성공 메시지 반환
        return res.json({ message: '비밀번호 재설정 링크를 발송했습니다.' });
      }

      // 재설정 토큰 생성 (1시간 유효)
      const resetToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간 후
      
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

      // 이메일 발송
      const baseUrl = req.protocol + '://' + req.get('host');
      const emailSent = await sendPasswordResetEmail(email, resetToken, baseUrl);
      
      if (!emailSent) {
        return res.status(500).json({ message: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' });
      }

      res.json({ message: '비밀번호 재설정 링크를 발송했습니다.' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password, confirmPassword } = req.body;
      
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' });
      }

      // 토큰 검증
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: '유효하지 않은 재설정 링크입니다.' });
      }

      if (resetToken.isUsed) {
        return res.status(400).json({ message: '이미 사용된 재설정 링크입니다.' });
      }

      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: '재설정 링크가 만료되었습니다.' });
      }

      // 비밀번호 업데이트
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(resetToken.userId, { password: hashedPassword });
      
      // 토큰을 사용됨으로 표시
      await storage.markPasswordResetTokenAsUsed(token);

      res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
