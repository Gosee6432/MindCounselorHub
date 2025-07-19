import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

// Use persistent SQLite database file instead of in-memory
const sqlite = new Database("./database.db");
sqlite.pragma("foreign_keys = ON");
export const db = drizzle(sqlite, { schema });

// Initialize tables with updated schema
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    role TEXT DEFAULT 'trainee',
    password_hash TEXT,
    is_active INTEGER DEFAULT 1,
    is_approved INTEGER DEFAULT 1,
    phone TEXT,
    gender TEXT,
    birth_year INTEGER,
    education TEXT,
    university TEXT,
    current_status TEXT,
    target_certification TEXT,
    counseling_experience TEXT,
    interests TEXT,
    license TEXT,
    license_number TEXT,
    association TEXT,
    experience INTEGER,
    specialization TEXT,
    therapeutic_approach TEXT,
    target_groups TEXT,
    counseling_methods TEXT,
    available_hours TEXT,
    hourly_rate TEXT,
    national_program TEXT,
    additional_fee TEXT,
    location TEXT,
    online_available TEXT,
    introduction TEXT,
    career_background TEXT,
    graduation_year INTEGER,
    current_work_location TEXT,
    work_experience TEXT,
    target_supervisor TEXT,
    learning_goals TEXT,
    challenges_and_concerns TEXT,
    supervision_format TEXT,
    total_supervision_hours INTEGER,
    group_supervision_hours INTEGER,
    individual_supervision_hours INTEGER,
    weekly_supervision_hours INTEGER,
    supervision_fee_per_hour INTEGER,
    national_program_participation INTEGER DEFAULT 0,
    national_program_additional_fee INTEGER DEFAULT 0,
    can_provide_client_experience INTEGER DEFAULT 0,
    client_experience_additional_fee INTEGER DEFAULT 0,
    accepts_new_trainees INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS supervisors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    affiliation TEXT,
    association TEXT,
    specialization TEXT,
    summary TEXT,
    profile_image_url TEXT,
    qualifications TEXT DEFAULT '[]',
    target_groups TEXT DEFAULT '[]',
    concern_types TEXT DEFAULT '[]',
    emotion_symptoms TEXT DEFAULT '[]',
    special_experiences TEXT DEFAULT '[]',
    counseling_regions TEXT DEFAULT '[]',
    counseling_methods TEXT DEFAULT '[]',
    contact_methods TEXT DEFAULT '[]',
    contact_info TEXT,
    website TEXT,
    kakao_id TEXT,
    phone_number TEXT,
    client_experience_fee INTEGER DEFAULT 0,
    can_provide_client_experience BOOLEAN DEFAULT 0,
    client_experience_additional_fee INTEGER DEFAULT 0,
    participates_in_national_program BOOLEAN DEFAULT 0,
    national_program_additional_fee INTEGER DEFAULT 0,
    is_profile_public BOOLEAN DEFAULT 1,
    is_visible BOOLEAN DEFAULT 1,
    allow_reviews BOOLEAN DEFAULT 1,
    approval_status TEXT DEFAULT 'pending',
    rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS counseling_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    supervisor_name TEXT,
    counseling_date DATETIME,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    nickname TEXT,
    password TEXT,
    is_anonymous BOOLEAN DEFAULT 1,
    likes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS community_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    nickname TEXT,
    password TEXT,
    is_anonymous BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id)
  );

  CREATE TABLE IF NOT EXISTS psychology_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    category TEXT DEFAULT 'general',
    author TEXT DEFAULT 'AI Assistant',
    read_time INTEGER DEFAULT 5,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS education_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    application_link TEXT,
    is_external BOOLEAN DEFAULT 1,
    deadline DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id TEXT NOT NULL,
    type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize database with test data if not exists
try {
  // Check if users table has password_hash column, if not add it
  const tableInfo = sqlite.prepare("PRAGMA table_info(users)").all() as any[];
  const hasPasswordHash = tableInfo.some((col: any) => col.name === 'password_hash');
  const hasPassword = tableInfo.some((col: any) => col.name === 'password');
  
  if (!hasPasswordHash && hasPassword) {
    sqlite.exec(`ALTER TABLE users RENAME COLUMN password TO password_hash;`);
    console.log('Renamed password column to password_hash');
  } else if (!hasPasswordHash) {
    sqlite.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT;`);
    console.log('Added password_hash column to users table');
  }

  // Check and add missing community_posts columns
  const communityTableInfo = sqlite.prepare("PRAGMA table_info(community_posts)").all() as any[];
  const hasAnonymousNickname = communityTableInfo.some((col: any) => col.name === 'anonymous_nickname');
  const hasViews = communityTableInfo.some((col: any) => col.name === 'views');
  const hasCommentCount = communityTableInfo.some((col: any) => col.name === 'comment_count');
  const hasIsReported = communityTableInfo.some((col: any) => col.name === 'is_reported');
  const hasIsBlinded = communityTableInfo.some((col: any) => col.name === 'is_blinded');

  if (!hasAnonymousNickname) {
    sqlite.exec(`ALTER TABLE community_posts ADD COLUMN anonymous_nickname TEXT;`);
    console.log('Added anonymous_nickname column');
  }
  if (!hasViews) {
    sqlite.exec(`ALTER TABLE community_posts ADD COLUMN views INTEGER DEFAULT 0;`);
    console.log('Added views column');
  }
  if (!hasCommentCount) {
    sqlite.exec(`ALTER TABLE community_posts ADD COLUMN comment_count INTEGER DEFAULT 0;`);
    console.log('Added comment_count column');
  }
  if (!hasIsReported) {
    sqlite.exec(`ALTER TABLE community_posts ADD COLUMN is_reported INTEGER DEFAULT 0;`);
    console.log('Added is_reported column');
  }
  if (!hasIsBlinded) {
    sqlite.exec(`ALTER TABLE community_posts ADD COLUMN is_blinded INTEGER DEFAULT 0;`);
    console.log('Added is_blinded column');
  }

  // Check and add missing community_comments columns
  const commentsTableInfo = sqlite.prepare("PRAGMA table_info(community_comments)").all() as any[];
  const hasParentId = commentsTableInfo.some((col: any) => col.name === 'parent_id');
  const hasAnonymousNicknameComment = commentsTableInfo.some((col: any) => col.name === 'anonymous_nickname');
  const hasPasswordComment = commentsTableInfo.some((col: any) => col.name === 'password');

  if (!hasParentId) {
    sqlite.exec(`ALTER TABLE community_comments ADD COLUMN parent_id INTEGER;`);
    console.log('Added parent_id column to comments');
  }
  if (!hasAnonymousNicknameComment) {
    sqlite.exec(`ALTER TABLE community_comments ADD COLUMN anonymous_nickname TEXT;`);
    console.log('Added anonymous_nickname column to comments');
  }
  if (!hasPasswordComment) {
    sqlite.exec(`ALTER TABLE community_comments ADD COLUMN password TEXT;`);
    console.log('Added password column to comments');
  }

  // Check what columns actually exist
  console.log('Community comments table structure:', commentsTableInfo.map((col: any) => col.name));

  // Update existing posts with anonymous_nickname if null
  sqlite.exec(`UPDATE community_posts SET anonymous_nickname = '익명사용자' WHERE anonymous_nickname IS NULL;`);

  sqlite.exec(`
    INSERT OR IGNORE INTO users (id, email, role, password_hash, first_name, last_name, is_active, is_approved) VALUES 
    ('admin-001', 'admin@test.com', 'admin', '$2b$12$bxVjvVw66BFB7BfiLymoV.zuIS2V/vqsj/njA0ObChfyHLNY2Smaa', '관리자', '계정', 1, 1),
    ('LM-OTpcLGNrUlmhS75gOQ', 'goseecloud@gmail.com', 'supervisor', '$2b$12$bxVjvVw66BFB7BfiLymoV.zuIS2V/vqsj/njA0ObChfyHLNY2Smaa', '김', '상담', 1, 1);

    INSERT OR IGNORE INTO supervisors (
      id, user_id, name, specialization, approval_status, is_visible, 
      target_groups, counseling_methods, contact_methods, contact_info,
      can_provide_client_experience, client_experience_additional_fee
    ) VALUES (
      7, 'LM-OTpcLGNrUlmhS75gOQ', '상담김', '블랙요원트라우마관리', 'approved', 1,
      '["청소년","아동","노인"]', '["가족치료","게슈탈트 치료"]', '["대면상담"]', 'goseecloud@gmail.com',
      1, 0
    );

    INSERT OR IGNORE INTO community_posts (id, user_id, title, content, category, anonymous_nickname, views, comment_count, is_reported, is_blinded) VALUES 
    (9, 'anonymous_user', '테스트 게시글', '테스트 내용입니다.', 'general', '익명사용자', 0, 0, 0, 0);

    INSERT OR IGNORE INTO psychology_articles (id, title, content, category, read_time, published_at) VALUES 
    (33, 'DBT 감정조절: 한국 상담심리사를 위한 실무 가이드', 'DBT(변증법적 행동치료)의 감정조절 기법에 대한 상세한 가이드입니다.', 'therapy', 8, datetime('now'));
  `);
} catch (error: any) {
  console.log('Database initialization complete or error:', error?.message || error);
}

