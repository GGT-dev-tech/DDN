-- 01-init-roles.sql
-- Create application user
CREATE USER stitch_app WITH PASSWORD 'app_secret';

-- Create migration user
CREATE USER stitch_migration WITH PASSWORD 'migration_secret';

-- Grant connection to the database
GRANT CONNECT ON DATABASE stitch_db TO stitch_app;
GRANT CONNECT ON DATABASE stitch_db TO stitch_migration;

-- Switch to the stitch_db database to apply schema-level permissions
\c stitch_db;

-- Give schema permissions
GRANT USAGE ON SCHEMA public TO stitch_app;
GRANT USAGE, CREATE ON SCHEMA public TO stitch_migration;

-- stitch_app needs DML permissions on existing tables (if any)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO stitch_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO stitch_app;

-- stitch_migration needs full permissions on existing tables to modify schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stitch_migration;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stitch_migration;

-- Alter default privileges for tables created in the future by stitch_migration
-- When stitch_migration creates a table, stitch_app should get DML access.
ALTER DEFAULT PRIVILEGES FOR ROLE stitch_migration IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO stitch_app;

-- Also grant sequence usage to stitch_app for new sequences created by stitch_migration
ALTER DEFAULT PRIVILEGES FOR ROLE stitch_migration IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO stitch_app;

-- Allow stitch_admin (the superuser) to grant the above default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE stitch_admin IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO stitch_app;

ALTER DEFAULT PRIVILEGES FOR ROLE stitch_admin IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO stitch_app;

-- Also let stitch_admin tables be fully managed by stitch_migration
ALTER DEFAULT PRIVILEGES FOR ROLE stitch_admin IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO stitch_migration;

ALTER DEFAULT PRIVILEGES FOR ROLE stitch_admin IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO stitch_migration;
