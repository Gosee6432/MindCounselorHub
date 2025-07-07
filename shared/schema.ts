import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  password_hash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull().default("trainee"), // supervisor, trainee, admin
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  isApproved: integer("is_approved", { mode: 'boolean' }).default(true), // supervisor approval status
  phone: text("phone"),
  gender: text("gender"),
  birthYear: integer("birth_year"),
  education: text("education"),
  university: text("university"),
  currentStatus: text("current_status"),
  targetCertification: text("target_certification"),
  counselingExperience: text("counseling_experience"),
  interests: text("interests"),
  license: text("license"),
  licenseNumber: text("license_number"),
  association: text("association"),
  experience: integer("experience"),
  specialization: text("specialization"),
  therapeuticApproach: text("therapeutic_approach"),
  targetGroups: text("target_groups"),
  counselingMethods: text("counseling_methods"),
  availableHours: text("available_hours"),
  hourlyRate: text("hourly_rate"),
  nationalProgram: text("national_program"),
  additionalFee: text("additional_fee"),
  location: text("location"),
  onlineAvailable: text("online_available"),
  introduction: text("introduction"),
  careerBackground: text("career_background"),
  graduationYear: integer("graduation_year"),
  currentWorkLocation: text("current_work_location"),
  workExperience: text("work_experience"),
  targetSupervisor: text("target_supervisor"),
  learningGoals: text("learning_goals"),
  challengesAndConcerns: text("challenges_and_concerns"),
  supervisionFormat: text("supervision_format"),
  totalSupervisionHours: integer("total_supervision_hours"),
  groupSupervisionHours: integer("group_supervision_hours"),
  individualSupervisionHours: integer("individual_supervision_hours"),
  weeklySupervisionHours: integer("weekly_supervision_hours"),
  supervisionFeePerHour: integer("supervision_fee_per_hour"),
  nationalProgramParticipation: integer("national_program_participation", { mode: 'boolean' }).default(false),
  nationalProgramAdditionalFee: integer("national_program_additional_fee", { mode: 'boolean' }).default(false),
  canProvideClientExperience: integer("can_provide_client_experience", { mode: 'boolean' }).default(false),
  clientExperienceAdditionalFee: integer("client_experience_additional_fee", { mode: 'boolean' }).default(false),
  acceptsNewTrainees: integer("accepts_new_trainees", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Supervisor profiles
export const supervisors = sqliteTable("supervisors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  gender: text("gender"), // 성별: male, female
  affiliation: text("affiliation"),
  association: text("association"), // 소속협회
  specialization: text("specialization"), // 전문분야
  summary: text("summary"),
  profileImageUrl: text("profile_image_url"),
  qualifications: text("qualifications"), // JSON string
  targetGroups: text("target_groups"), // JSON string
  concernTypes: text("concern_types"), // JSON string
  emotionSymptoms: text("emotion_symptoms"), // JSON string
  specialExperiences: text("special_experiences"), // JSON string
  counselingRegions: text("counseling_regions"), // JSON string
  counselingMethods: text("counseling_methods"), // JSON string
  contactMethods: text("contact_methods"), // JSON string
  contactInfo: text("contact_info"),
  website: text("website"),
  kakaoId: text("kakao_id"),
  phoneNumber: text("phone_number"),
  clientExperienceFee: integer("client_experience_fee").default(0),
  canProvideClientExperience: integer("can_provide_client_experience", { mode: 'boolean' }).default(false),
  clientExperienceAdditionalFee: integer("client_experience_additional_fee").default(0),
  participatesInNationalProgram: integer("participates_in_national_program", { mode: 'boolean' }).default(false),
  nationalProgramAdditionalFee: integer("national_program_additional_fee"), // null = 없음, 0 = 무료, 숫자 = 해당 금액
  isProfilePublic: integer("is_profile_public", { mode: 'boolean' }).default(true),
  isVisible: integer("is_visible", { mode: 'boolean' }).default(true),
  approvalStatus: text("approval_status").default("pending"), // pending, approved, rejected
  rating: integer("rating").default(0), // 향후 리뷰 평점용
  reviewCount: integer("review_count").default(0), // 향후 리뷰 개수용
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Counseling records (private to each trainee)
export const counselingRecords = sqliteTable("counseling_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  supervisorName: text("supervisor_name"),
  counselingDate: integer("counseling_date", { mode: 'timestamp' }),
  tags: text("tags"), // JSON string
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Anonymous community posts
export const communityPosts = sqliteTable("community_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  anonymousNickname: text("anonymous_nickname").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  commentCount: integer("comment_count").default(0),
  isReported: integer("is_reported", { mode: 'boolean' }).default(false),
  isBlinded: integer("is_blinded", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const communityComments = sqliteTable("community_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  userId: text("user_id").notNull().references(() => users.id),
  parentId: integer("parent_id").references((): any => communityComments.id),
  anonymousNickname: text("anonymous_nickname"),
  content: text("content").notNull(),
  password: text("password"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Post likes tracking
export const postLikes = sqliteTable("post_likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => communityPosts.id),
  ipAddress: text("ip_address").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Reports for moderation
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  commentId: integer("comment_id").references(() => communityComments.id),
  reporterId: text("reporter_id").notNull().references(() => users.id),
  reportedUserId: text("reported_user_id").references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Password reset tokens
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  isUsed: integer("is_used", { mode: 'boolean' }).default(false),
  expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Education posts (informational content)
export const educationPosts = sqliteTable("education_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  provider: text("provider").notNull(),
  startDate: integer("start_date", { mode: 'timestamp' }),
  endDate: integer("end_date", { mode: 'timestamp' }),
  location: text("location"),
  isOnline: integer("is_online", { mode: 'boolean' }).default(false),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  cost: text("cost"),
  contactInfo: text("contact_info"),
  tags: text("tags"), // JSON string
  views: integer("views").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertSupervisor = typeof supervisors.$inferInsert;
export type Supervisor = typeof supervisors.$inferSelect;
export type InsertCounselingRecord = typeof counselingRecords.$inferInsert;
export type CounselingRecord = typeof counselingRecords.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityComment = typeof communityComments.$inferInsert;
export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertEducationPost = typeof educationPosts.$inferInsert;
export type EducationPost = typeof educationPosts.$inferSelect;

// Psychology articles table
export const psychologyArticles = sqliteTable("psychology_articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: text("category").default("general"),
  author: text("author").default("AI Assistant"),
  readTime: integer("read_time").default(5),
  publishedAt: integer("published_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type InsertPsychologyArticle = typeof psychologyArticles.$inferInsert;
export type PsychologyArticle = typeof psychologyArticles.$inferSelect;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertSupervisorSchema = createInsertSchema(supervisors);
export const insertCounselingRecordSchema = createInsertSchema(counselingRecords);
export const insertCommunityPostSchema = createInsertSchema(communityPosts);
export const insertCommunityCommentSchema = createInsertSchema(communityComments);
export const insertReportSchema = createInsertSchema(reports);
export const insertEducationPostSchema = createInsertSchema(educationPosts);
export const insertPsychologyArticleSchema = createInsertSchema(psychologyArticles);

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type InsertSupervisorType = z.infer<typeof insertSupervisorSchema>;
export type InsertCounselingRecordType = z.infer<typeof insertCounselingRecordSchema>;
export type InsertCommunityPostType = z.infer<typeof insertCommunityPostSchema>;
export type InsertCommunityCommentType = z.infer<typeof insertCommunityCommentSchema>;
export type InsertReportType = z.infer<typeof insertReportSchema>;
export type InsertEducationPostType = z.infer<typeof insertEducationPostSchema>;
export type InsertPsychologyArticleType = z.infer<typeof insertPsychologyArticleSchema>;