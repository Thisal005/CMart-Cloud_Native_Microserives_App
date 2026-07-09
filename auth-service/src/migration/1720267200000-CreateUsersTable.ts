import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1720267200000 implements MigrationInterface {
  name = 'CreateUsersTable1720267200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create ENUM types if they don't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE "user_role" AS ENUM ('USER', 'ADMIN');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
          CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
        END IF;
      END$$;
    `);

    // Create users table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
        "first_name"      VARCHAR(100)    NOT NULL,
        "last_name"       VARCHAR(100)    NOT NULL,
        "email"           VARCHAR(255)    NOT NULL,
        "password_hash"   VARCHAR(255)    NOT NULL,
        "phone_number"    VARCHAR(20),
        "role"            "user_role"     NOT NULL DEFAULT 'USER',
        "status"          "account_status" NOT NULL DEFAULT 'ACTIVE',
        "email_verified"  BOOLEAN         NOT NULL DEFAULT FALSE,
        "created_at"      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        "updated_at"      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        "last_login_at"   TIMESTAMPTZ
      )
    `);

    // Create indexes if they don't exist
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_users_role_status" ON "users" ("role", "status")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_users_email_unverified" ON "users" ("email") WHERE "email_verified" = FALSE`
    );

    // Create auto-update trigger for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION fn_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_users_updated_at ON "users"`);
    await queryRunner.query(`
      CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON "users"
        FOR EACH ROW
        EXECUTE FUNCTION fn_set_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_users_updated_at ON "users"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS fn_set_updated_at`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email_unverified"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_role_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_email"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop ENUM types
    await queryRunner.query(`DROP TYPE IF EXISTS "account_status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role"`);
  }
}
