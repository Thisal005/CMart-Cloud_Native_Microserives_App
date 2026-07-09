import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1720267300000 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1720267300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id"          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
        "token"       VARCHAR(255)  NOT NULL UNIQUE,
        "user_id"     UUID          NOT NULL,
        "expires_at"  TIMESTAMPTZ   NOT NULL,
        "created_at"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "revoked_at"  TIMESTAMPTZ,
        CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    // Create index on token for fast lookups
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_refresh_tokens_token" ON "refresh_tokens" ("token")
    `);

    // Create index on user_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_refresh_tokens_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_refresh_tokens_token"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
  }
}
