import {
  users,
  supervisors,
  counselingRecords,
  communityPosts,
  communityComments,
  postLikes,
  reports,
  passwordResetTokens,
  educationPosts,
  type User,
  type UpsertUser,
  type Supervisor,
  type InsertSupervisor,
  type CounselingRecord,
  type InsertCounselingRecord,
  type CommunityPost,
  type InsertCommunityPost,
  type CommunityComment,
  type InsertCommunityComment,
  type PostLike,
  type InsertPostLike,
  type Report,
  type InsertReport,
  type EducationPost,
  type InsertEducationPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, or, inArray, count, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Password reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: string; isUsed: boolean; expiresAt: Date } | undefined>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  
  // Supervisor operations
  createSupervisor(supervisor: InsertSupervisor): Promise<Supervisor>;
  updateSupervisor(id: number, supervisor: Partial<InsertSupervisor>): Promise<Supervisor>;
  getSupervisor(id: number): Promise<Supervisor | undefined>;
  getSupervisorByUserId(userId: string): Promise<Supervisor | undefined>;
  getSupervisors(filters?: {
    search?: string;
    association?: string;
    specialization?: string;
    qualifications?: string[];
    targetGroups?: string[];
    concernTypes?: string[];
    emotionSymptoms?: string[];
    specialExperiences?: string[];
    counselingMethods?: string[];
    participatesInNationalProgram?: boolean;
    noAdditionalFee?: boolean;
  }): Promise<Supervisor[]>;
  
  // Counseling records operations
  createCounselingRecord(record: InsertCounselingRecord): Promise<CounselingRecord>;
  updateCounselingRecord(id: number, record: Partial<InsertCounselingRecord>): Promise<CounselingRecord>;
  deleteCounselingRecord(id: number, userId: string): Promise<void>;
  getCounselingRecord(id: number, userId: string): Promise<CounselingRecord | undefined>;
  getCounselingRecords(userId: string): Promise<CounselingRecord[]>;
  
  // Community operations
  createCommunityPost(post: InsertCommunityPost & { userId: string; category: string }): Promise<CommunityPost>;
  getCommunityPosts(filters?: { search?: string; category?: string }): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  likeCommunityPost(postId: number, ipAddress: string): Promise<{ success: boolean; message: string }>;
  hasUserLikedPost(postId: number, ipAddress: string): Promise<boolean>;
  
  createCommunityComment(comment: InsertCommunityComment & { userId: string; password: string }): Promise<CommunityComment>;
  getCommunityComments(postId: number): Promise<CommunityComment[]>;
  createCommentReply(reply: InsertCommunityComment & { userId: string; parentId: number; password: string }): Promise<CommunityComment>;
  editCommunityComment(commentId: number, data: { nickname: string; password: string; content: string }): Promise<CommunityComment>;
  deleteCommunityComment(commentId: number, password: string): Promise<void>;
  likeCommunityComment(commentId: number): Promise<void>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReports(): Promise<Report[]>;
  updateReportStatus(id: number, status: string): Promise<Report>;
  
  // Admin operations
  getStats(): Promise<{
    totalSupervisors: number;
    totalTrainees: number;
    totalRecords: number;
    totalPosts: number;
  }>;
  getPendingSupervisors(): Promise<Supervisor[]>;
  approveSupervisor(id: number): Promise<Supervisor>;
  

  
  // Profile visibility toggle
  toggleSupervisorProfileVisibility(supervisorId: number, isVisible: boolean): Promise<Supervisor>;
  
  // Education posts operations
  createEducationPost(post: InsertEducationPost): Promise<EducationPost>;
  getEducationPosts(filters?: { search?: string; category?: string }): Promise<EducationPost[]>;
  getEducationPost(id: number): Promise<EducationPost | undefined>;
  updateEducationPost(id: number, post: Partial<InsertEducationPost>): Promise<EducationPost>;
  deleteEducationPost(id: number): Promise<void>;
}

function generateAnonymousNickname(): string {
  const adjectives = ['익명의', '조용한', '열정적인', '성실한', '배우는', '노력하는', '진실한', '따뜻한'];
  const nouns = ['수련생', '상담사', '학습자', '연구자', '실습생', '전문가', '동료', '멘티'];
  const numbers = Math.floor(Math.random() * 9999) + 1;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}`;
}

function maskName(name: string): string {
  if (!name || name.length < 2) return name;
  
  if (name.length === 2) {
    return name[0] + '*';
  } else if (name.length === 3) {
    return name[0] + '*' + name[2];
  } else {
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    // If profile image is updated and user is a supervisor, update supervisor table too
    if (userData.profileImageUrl !== undefined) {
      await db
        .update(supervisors)
        .set({ 
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date()
        })
        .where(eq(supervisors.userId, id));
    }
    
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        role: userData.role || "trainee",
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Supervisor operations
  async createSupervisor(supervisor: InsertSupervisor): Promise<Supervisor> {
    const [newSupervisor] = await db
      .insert(supervisors)
      .values({
        ...supervisor,
        approvalStatus: "pending" // 새 수퍼바이저는 기본적으로 대기 상태
      })
      .returning();
    return newSupervisor;
  }

  async updateSupervisor(id: number, supervisor: Partial<InsertSupervisor>): Promise<Supervisor> {
    const [updatedSupervisor] = await db
      .update(supervisors)
      .set({
        ...supervisor,
        updatedAt: new Date(),
      })
      .where(eq(supervisors.id, id))
      .returning();
    return updatedSupervisor;
  }

  async getSupervisor(id: number): Promise<Supervisor | undefined> {
    const [supervisor] = await db
      .select()
      .from(supervisors)
      .where(eq(supervisors.id, id));
    
    if (supervisor) {
      return {
        ...supervisor,
        name: maskName(supervisor.name)
      };
    }
    return supervisor;
  }

  async getSupervisorByUserId(userId: string): Promise<Supervisor | undefined> {
    const [supervisor] = await db
      .select()
      .from(supervisors)
      .where(eq(supervisors.userId, userId));
    return supervisor;
  }

  async getSupervisors(filters?: {
    search?: string;
    association?: string;
    specialization?: string;
    qualifications?: string[];
    targetGroups?: string[];
    concernTypes?: string[];
    emotionSymptoms?: string[];
    specialExperiences?: string[];
    counselingMethods?: string[];
    participatesInNationalProgram?: boolean;
    noAdditionalFee?: boolean;
  }): Promise<Supervisor[]> {
    const conditions = [
      eq(supervisors.approvalStatus, "approved")
    ];

    if (filters?.search) {
      conditions.push(
        or(
          like(supervisors.name, `%${filters.search}%`),
          like(supervisors.affiliation, `%${filters.search}%`),
          like(supervisors.summary, `%${filters.search}%`),
          like(supervisors.association, `%${filters.search}%`),
          like(supervisors.specialization, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.association) {
      conditions.push(eq(supervisors.association, filters.association));
    }

    if (filters?.specialization) {
      conditions.push(eq(supervisors.specialization, filters.specialization));
    }

    if (filters?.participatesInNationalProgram !== undefined) {
      conditions.push(eq(supervisors.participatesInNationalProgram, filters.participatesInNationalProgram));
    }

    if (filters?.noAdditionalFee) {
      conditions.push(eq(supervisors.nationalProgramAdditionalFee, 0));
    }

    const finalQuery = db.select().from(supervisors).where(and(...conditions));
    const supervisorList = await finalQuery.orderBy(desc(supervisors.rating));
    
    // Mask supervisor names for privacy
    return supervisorList.map(supervisor => ({
      ...supervisor,
      name: maskName(supervisor.name)
    }));
  }

  // Counseling records operations
  async createCounselingRecord(record: InsertCounselingRecord): Promise<CounselingRecord> {
    const [newRecord] = await db
      .insert(counselingRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async updateCounselingRecord(id: number, record: Partial<InsertCounselingRecord>): Promise<CounselingRecord> {
    const [updatedRecord] = await db
      .update(counselingRecords)
      .set({
        ...record,
        updatedAt: new Date(),
      })
      .where(eq(counselingRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteCounselingRecord(id: number, userId: string): Promise<void> {
    await db
      .delete(counselingRecords)
      .where(and(eq(counselingRecords.id, id), eq(counselingRecords.userId, userId)));
  }

  async getCounselingRecord(id: number, userId: string): Promise<CounselingRecord | undefined> {
    const [record] = await db
      .select()
      .from(counselingRecords)
      .where(and(eq(counselingRecords.id, id), eq(counselingRecords.userId, userId)));
    return record;
  }

  async getCounselingRecords(userId: string): Promise<CounselingRecord[]> {
    return await db
      .select()
      .from(counselingRecords)
      .where(eq(counselingRecords.userId, userId))
      .orderBy(desc(counselingRecords.createdAt));
  }

  // Community operations
  async createCommunityPost(post: InsertCommunityPost & { userId: string; category: string; password?: string }): Promise<CommunityPost> {
    try {
      const anonymousNickname = post.anonymousNickname || generateAnonymousNickname();
      const [newPost] = await db
        .insert(communityPosts)
        .values({
          title: post.title,
          content: post.content,
          category: post.category,
          userId: post.userId,
          anonymousNickname,
          likes: 0,
          views: 0,
          commentCount: 0,
          isReported: false,
          isBlinded: false,
        })
        .returning();
      
      return newPost;
    } catch (error) {
      console.error('Create community post error:', error);
      throw new Error('Failed to create community post');
    }
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    try {
      const posts = await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.isBlinded, false))
        .orderBy(desc(communityPosts.createdAt));

      // Get comment counts for each post
      const postsWithCommentCount = await Promise.all(
        posts.map(async (post) => {
          try {
            const [commentCountResult] = await db
              .select({ count: sql<number>`count(*)` })
              .from(communityComments)
              .where(eq(communityComments.postId, post.id));

            const commentCount = Number(commentCountResult?.count) || 0;
            
            return {
              ...post,
              commentCount
            };
          } catch (error) {
            console.error(`Error counting comments for post ${post.id}:`, error);
            return {
              ...post,
              commentCount: 0
            };
          }
        })
      );

      return postsWithCommentCount;
    } catch (error) {
      console.error('Get community posts error:', error);
      return [];
    }
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(and(eq(communityPosts.id, id), eq(communityPosts.isBlinded, false)));
    return post;
  }

  async likeCommunityPost(postId: number, ipAddress: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simple like implementation without complex transactions
      const [currentPost] = await db
        .select({ likes: communityPosts.likes })
        .from(communityPosts)
        .where(eq(communityPosts.id, postId));
      
      const newLikes = (currentPost?.likes || 0) + 1;
      
      await db
        .update(communityPosts)
        .set({ likes: newLikes })
        .where(eq(communityPosts.id, postId));

      return { success: true, message: "추천이 완료되었습니다." };
    } catch (error) {
      console.error('Like post error:', error);
      return { success: false, message: "추천 처리 중 오류가 발생했습니다." };
    }
  }

  async hasUserLikedPost(postId: number, ipAddress: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.ipAddress, ipAddress)))
      .limit(1);
    
    return existingLike.length > 0;
  }

  async createCommunityComment(comment: InsertCommunityComment & { userId: string; password: string }): Promise<CommunityComment> {
    try {
      const [newComment] = await db
        .insert(communityComments)
        .values({
          postId: comment.postId,
          userId: comment.userId,
          content: comment.content,
          anonymousNickname: comment.anonymousNickname || generateAnonymousNickname(),
          password: comment.password,
          parentId: comment.parentId || null,
        })
        .returning();
      return newComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('댓글 작성에 실패했습니다.');
    }
  }

  async getCommunityComments(postId: number): Promise<CommunityComment[]> {
    try {
      return await db
        .select()
        .from(communityComments)
        .where(eq(communityComments.postId, postId))
        .orderBy(asc(communityComments.createdAt));
    } catch (error) {
      console.error('Get comments error:', error);
      return [];
    }
  }

  async createCommentReply(reply: InsertCommunityComment & { userId: string; parentId: number; password: string }): Promise<CommunityComment> {
    try {
      const [newReply] = await db
        .insert(communityComments)
        .values({
          postId: reply.postId,
          userId: reply.userId,
          content: reply.content,
          parentId: reply.parentId,
          anonymousNickname: reply.anonymousNickname || generateAnonymousNickname(),
          password: reply.password,
        })
        .returning();
      return newReply;
    } catch (error) {
      console.error('Error creating reply:', error);
      throw new Error('답글 작성에 실패했습니다.');
    }
  }

  async editCommunityComment(commentId: number, data: { nickname: string; password: string; content: string }): Promise<CommunityComment> {
    // First verify the password
    const [existingComment] = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.id, commentId));
    
    if (!existingComment) {
      throw new Error("Comment not found");
    }
    
    if (existingComment.password !== data.password) {
      throw new Error("Invalid password");
    }
    
    // Update the comment
    const [updatedComment] = await db
      .update(communityComments)
      .set({
        content: data.content,
        anonymousNickname: data.nickname,
        updatedAt: new Date(),
      })
      .where(eq(communityComments.id, commentId))
      .returning();
    
    return updatedComment;
  }

  async deleteCommunityComment(commentId: number, password: string): Promise<void> {
    // First verify the password
    const [existingComment] = await db
      .select()
      .from(communityComments)
      .where(eq(communityComments.id, commentId));
    
    if (!existingComment) {
      throw new Error("Comment not found");
    }
    
    if (existingComment.password !== password) {
      throw new Error("Invalid password");
    }
    
    // Delete the comment
    await db
      .delete(communityComments)
      .where(eq(communityComments.id, commentId));
  }

  async likeCommunityComment(commentId: number): Promise<void> {
    await db
      .update(communityComments)
      .set({
        likes: db.select({ likes: communityComments.likes }).from(communityComments).where(eq(communityComments.id, commentId)).then(result => (result[0]?.likes || 0) + 1),
      })
      .where(eq(communityComments.id, commentId));
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async updateReportStatus(id: number, status: string): Promise<Report> {
    const [updatedReport] = await db
      .update(reports)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  // Admin operations
  async getStats(): Promise<{
    totalSupervisors: number;
    totalTrainees: number;
    totalRecords: number;
    totalPosts: number;
  }> {
    const [supervisorCount] = await db.select({ count: count() }).from(supervisors);
    const [traineeCount] = await db.select({ count: count() }).from(users).where(eq(users.role, 'trainee'));
    const [recordCount] = await db.select({ count: count() }).from(counselingRecords);
    const [postCount] = await db.select({ count: count() }).from(communityPosts);

    return {
      totalSupervisors: supervisorCount.count,
      totalTrainees: traineeCount.count,
      totalRecords: recordCount.count,
      totalPosts: postCount.count,
    };
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
      isUsed: false,
    });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; isUsed: boolean; expiresAt: Date } | undefined> {
    const [result] = await db
      .select({
        userId: passwordResetTokens.userId,
        isUsed: passwordResetTokens.isUsed,
        expiresAt: passwordResetTokens.expiresAt,
      })
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    
    return result;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ isUsed: true })
      .where(eq(passwordResetTokens.token, token));
  }

  // Admin supervisor approval methods
  async getPendingSupervisors(): Promise<Supervisor[]> {
    return await db
      .select()
      .from(supervisors)
      .where(eq(supervisors.approvalStatus, "pending"))
      .orderBy(supervisors.createdAt);
  }

  async approveSupervisor(id: number): Promise<Supervisor> {
    const [supervisor] = await db
      .update(supervisors)
      .set({ 
        approvalStatus: "approved",
        updatedAt: new Date()
      })
      .where(eq(supervisors.id, id))
      .returning();
    return supervisor;
  }

  // Education posts methods
  async createEducationPost(postData: InsertEducationPost): Promise<EducationPost> {
    const [post] = await db
      .insert(educationPosts)
      .values(postData)
      .returning();
    return post;
  }

  async getEducationPosts(filters?: { search?: string; category?: string }): Promise<EducationPost[]> {
    try {
      let query = db.select().from(educationPosts);

      if (filters?.search) {
        query = query.where(
          or(
            like(educationPosts.title, `%${filters.search}%`),
            like(educationPosts.content, `%${filters.search}%`)
          )
        );
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.where(eq(educationPosts.category, filters.category));
      }

      return await query.orderBy(desc(educationPosts.createdAt));
    } catch (error) {
      console.error('Get education posts error:', error);
      return [];
    }
  }

  async getEducationPost(id: number): Promise<EducationPost | undefined> {
    const [post] = await db
      .select()
      .from(educationPosts)
      .where(eq(educationPosts.id, id));
    return post;
  }

  async updateEducationPost(id: number, postData: Partial<InsertEducationPost>): Promise<EducationPost> {
    const [post] = await db
      .update(educationPosts)
      .set({ ...postData, updatedAt: new Date() })
      .where(eq(educationPosts.id, id))
      .returning();
    return post;
  }

  async deleteEducationPost(id: number): Promise<void> {
    await db.delete(educationPosts).where(eq(educationPosts.id, id));
  }

  async toggleSupervisorProfileVisibility(supervisorId: number, isVisible: boolean): Promise<Supervisor> {
    const [supervisor] = await db
      .update(supervisors)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(supervisors.id, supervisorId))
      .returning();
    return supervisor;
  }
}

// Legacy MemStorage class - not used anymore, keeping for reference
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private supervisors: Map<number, Supervisor> = new Map();
  private counselingRecords: Map<number, CounselingRecord> = new Map();
  private communityPosts: Map<number, CommunityPost> = new Map();
  private communityComments: Map<number, CommunityComment> = new Map();
  private reports: Map<number, Report> = new Map();
  private educationPosts: Map<number, EducationPost> = new Map();
  private passwordResetTokens: Map<string, { userId: string; isUsed: boolean; expiresAt: Date }> = new Map();
  private postLikes: Map<string, boolean> = new Map();
  private nextId = 1;

  // Initialize with admin user and sample data
  constructor() {
    this.users.set('admin-001', {
      id: 'admin-001',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'admin',
      passwordHash: '$2b$10$TJpHZiWcN81FqacVRKoPpuT0xAciUCMb0jF1nIFJCW7xJ7bon2Cca' // admin123
    });

    this.users.set('LM-OTpcLGNrUlmhS75gOQ', {
      id: 'LM-OTpcLGNrUlmhS75gOQ',
      email: 'goseecloud@gmail.com',
      firstName: '김',
      lastName: '상담',
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: 'supervisor',
      passwordHash: '$2b$10$TJpHZiWcN81FqacVRKoPpuT0xAciUCMb0jF1nIFJCW7xJ7bon2Cca' // admin123 (same password for testing)
    });

    this.supervisors.set(7, {
      id: 7,
      userId: 'LM-OTpcLGNrUlmhS75gOQ',
      name: '상담김',
      gender: '',
      affiliation: null,
      association: null,
      specialization: '블랙요원트라우마관리',
      summary: null,
      profileImageUrl: null,
      qualifications: [],
      targetGroups: ['청소년', '아동', '노인'],
      concernTypes: [],
      emotionSymptoms: [],
      specialExperiences: [],
      counselingRegions: [],
      counselingMethods: ['가족치료', '게슈탈트 치료'],
      contactMethods: ['대면상담'],
      contactInfo: 'goseecloud@gmail.com',
      website: null,
      kakaoId: null,
      phoneNumber: null,
      clientExperienceFee: 0,
      participatesInNationalProgram: false,
      nationalProgramAdditionalFee: 0,
      isProfilePublic: true,
      isVisible: true,
      allowReviews: true,
      approvalStatus: 'approved',
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.communityPosts.set(9, {
      id: 9,
      userId: 'anonymous_175057327',
      title: '수퍼비전 경험 공유',
      content: '좋은 수퍼바이저를 만나는 것이 정말 중요하다는 것을 느꼈습니다.',
      category: '수퍼비전 후기',
      nickname: '익명사용자',
      password: 'hashed_password',
      isAnonymous: true,
      isPinned: false,
      likes: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.educationPosts.set(1, {
      id: 1,
      title: '상담심리 전문가 과정',
      content: '상담심리 전문가 자격증 취득을 위한 교육 과정입니다.',
      category: '자격증',
      applicationLink: 'https://example.com/apply',
      isExternal: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.reports.set(1, {
      id: 1,
      reporterId: 'QVPfiXgeaLzPml2I_U',
      type: 'community_post',
      targetId: 9,
      reason: '부적절한 내용',
      description: '게시글 내용이 부적절합니다.',
      status: 'pending',
      createdAt: new Date()
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) throw new Error('User not found');
    
    const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    if (existingUser) {
      return this.updateUser(userData.id, userData);
    } else {
      return this.createUser(userData);
    }
  }

  async getSupervisors(): Promise<Supervisor[]> {
    return Array.from(this.supervisors.values()).filter(s => s.approvalStatus === 'approved' && s.isVisible);
  }

  async getSupervisor(id: number): Promise<Supervisor | undefined> {
    return this.supervisors.get(id);
  }

  async getSupervisorByUserId(userId: string): Promise<Supervisor | undefined> {
    for (const supervisor of this.supervisors.values()) {
      if (supervisor.userId === userId) return supervisor;
    }
    return undefined;
  }

  async createSupervisor(supervisor: InsertSupervisor): Promise<Supervisor> {
    const newSupervisor: Supervisor = {
      ...supervisor,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.supervisors.set(newSupervisor.id, newSupervisor);
    return newSupervisor;
  }

  async updateSupervisor(id: number, supervisor: Partial<InsertSupervisor>): Promise<Supervisor> {
    const existing = this.supervisors.get(id);
    if (!existing) throw new Error('Supervisor not found');
    
    const updated = { ...existing, ...supervisor, updatedAt: new Date() };
    this.supervisors.set(id, updated);
    return updated;
  }

  async toggleSupervisorProfileVisibility(supervisorId: number, isVisible: boolean): Promise<Supervisor> {
    return this.updateSupervisor(supervisorId, { isVisible });
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values()).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async updateReportStatus(id: number, status: string): Promise<Report> {
    const report = this.reports.get(id);
    if (!report) throw new Error('Report not found');
    
    const updated = { ...report, status };
    this.reports.set(id, updated);
    return updated;
  }

  async getStats() {
    return {
      totalSupervisors: this.supervisors.size,
      totalTrainees: Array.from(this.users.values()).filter(u => u.role === 'trainee').length,
      totalRecords: this.counselingRecords.size,
      totalPosts: this.communityPosts.size
    };
  }

  async getPendingSupervisors(): Promise<Supervisor[]> {
    return Array.from(this.supervisors.values()).filter(s => s.approvalStatus === 'pending');
  }

  async approveSupervisor(id: number): Promise<Supervisor> {
    return this.updateSupervisor(id, { approvalStatus: 'approved' });
  }

  async getEducationPosts(): Promise<EducationPost[]> {
    return Array.from(this.educationPosts.values());
  }

  // Stub implementations for other required methods
  async createPasswordResetToken(): Promise<void> {}
  async getPasswordResetToken(): Promise<any> { return undefined; }
  async markPasswordResetTokenAsUsed(): Promise<void> {}
  async createCounselingRecord(): Promise<any> { throw new Error('Not implemented'); }
  async updateCounselingRecord(): Promise<any> { throw new Error('Not implemented'); }
  async deleteCounselingRecord(): Promise<void> {}
  async getCounselingRecord(): Promise<any> { return undefined; }
  async getCounselingRecords(): Promise<any[]> { return []; }
  async createCommunityPost(): Promise<any> { throw new Error('Not implemented'); }
  async getCommunityPost(): Promise<any> { return undefined; }
  async likeCommunityPost(): Promise<any> { return { success: false, message: 'Not implemented' }; }
  async hasUserLikedPost(): Promise<boolean> { return false; }
  async createCommunityComment(): Promise<any> { throw new Error('Not implemented'); }
  async getCommunityComments(): Promise<any[]> { return []; }
  async createCommentReply(): Promise<any> { throw new Error('Not implemented'); }
  async editCommunityComment(): Promise<any> { throw new Error('Not implemented'); }
  async deleteCommunityComment(): Promise<void> {}
  async likeCommunityComment(): Promise<void> {}
  async createReport(): Promise<any> { throw new Error('Not implemented'); }
  async createSupervisorContactMethod(): Promise<any> { throw new Error('Not implemented'); }
  async getSupervisorContactMethods(): Promise<any[]> { return []; }
  async updateSupervisorContactMethod(): Promise<any> { throw new Error('Not implemented'); }
  async deleteSupervisorContactMethod(): Promise<void> {}
  async createEducationPost(): Promise<any> { throw new Error('Not implemented'); }
  async getEducationPost(): Promise<any> { return undefined; }
  async updateEducationPost(): Promise<any> { throw new Error('Not implemented'); }
  async deleteEducationPost(): Promise<void> {}
}

export const storage = new DatabaseStorage();
