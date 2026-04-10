-- Drop database if exists (clean slate)
DROP DATABASE IF EXISTS yacs;

-- Create database
CREATE DATABASE yacs;

-- Create user if it doesn't exist
DO $$
BEGIN
  CREATE USER yacs WITH PASSWORD 'yacs';
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Connect to the yacs database and grant privileges
\c yacs

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE yacs TO yacs;

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO yacs;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO yacs;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO yacs;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO yacs;
