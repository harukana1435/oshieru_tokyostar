-- Reset database: recreate all tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('life', 'oshi')),
  name TEXT NOT NULL,
  balance_cached REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  amount REAL NOT NULL,
  sign TEXT NOT NULL CHECK (sign IN ('in', 'out')),
  purpose TEXT NOT NULL CHECK (purpose IN ('salary', 'ticket', 'goods', 'event', 'food', 'rent', 'utilities', 'transport', 'other')),
  memo TEXT,
  original_description TEXT,
  is_auto_categorized INTEGER NOT NULL DEFAULT 0,
  is_pending INTEGER NOT NULL DEFAULT 0,
  can_edit INTEGER NOT NULL DEFAULT 1,
  original_code INTEGER,
  event_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score REAL NOT NULL,
  label TEXT NOT NULL,
  snapshot_at INTEGER NOT NULL,
  factors TEXT NOT NULL, -- JSON string
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_score REAL NOT NULL,
  terms_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

-- User Rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('eligible', 'redeemed')),
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('life', 'oshi')),
  name TEXT NOT NULL,
  balance_cached REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  amount REAL NOT NULL,
  sign TEXT NOT NULL CHECK (sign IN ('in', 'out')),
  purpose TEXT NOT NULL CHECK (purpose IN ('salary', 'ticket', 'goods', 'event', 'food', 'rent', 'utilities', 'transport', 'other')),
  memo TEXT,
  original_description TEXT,
  is_auto_categorized INTEGER NOT NULL DEFAULT 0,
  is_pending INTEGER NOT NULL DEFAULT 0,
  can_edit INTEGER NOT NULL DEFAULT 1,
  original_code INTEGER,
  event_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score REAL NOT NULL,
  label TEXT NOT NULL,
  snapshot_at INTEGER NOT NULL,
  factors TEXT NOT NULL, -- JSON string
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_score REAL NOT NULL,
  terms_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

-- User Rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('eligible', 'redeemed')),
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('life', 'oshi')),
  name TEXT NOT NULL,
  balance_cached REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  amount REAL NOT NULL,
  sign TEXT NOT NULL CHECK (sign IN ('in', 'out')),
  purpose TEXT NOT NULL CHECK (purpose IN ('salary', 'ticket', 'goods', 'event', 'food', 'rent', 'utilities', 'transport', 'other')),
  memo TEXT,
  original_description TEXT,
  is_auto_categorized INTEGER NOT NULL DEFAULT 0,
  is_pending INTEGER NOT NULL DEFAULT 0,
  can_edit INTEGER NOT NULL DEFAULT 1,
  original_code INTEGER,
  event_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score REAL NOT NULL,
  label TEXT NOT NULL,
  snapshot_at INTEGER NOT NULL,
  factors TEXT NOT NULL, -- JSON string
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_score REAL NOT NULL,
  terms_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

-- User Rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('eligible', 'redeemed')),
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  created_at INTEGER NOT NULL
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('life', 'oshi')),
  name TEXT NOT NULL,
  balance_cached REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  amount REAL NOT NULL,
  sign TEXT NOT NULL CHECK (sign IN ('in', 'out')),
  purpose TEXT NOT NULL CHECK (purpose IN ('salary', 'ticket', 'goods', 'event', 'food', 'rent', 'utilities', 'transport', 'other')),
  memo TEXT,
  original_description TEXT,
  is_auto_categorized INTEGER NOT NULL DEFAULT 0,
  is_pending INTEGER NOT NULL DEFAULT 0,
  can_edit INTEGER NOT NULL DEFAULT 1,
  original_code INTEGER,
  event_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score REAL NOT NULL,
  label TEXT NOT NULL,
  snapshot_at INTEGER NOT NULL,
  factors TEXT NOT NULL, -- JSON string
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_score REAL NOT NULL,
  terms_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

-- User Rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('eligible', 'redeemed')),
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);
