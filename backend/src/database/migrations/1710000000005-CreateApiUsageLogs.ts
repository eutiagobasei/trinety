import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiUsageLogs1710000000005 implements MigrationInterface {
  name = 'CreateApiUsageLogs1710000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create api_usage_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "api_usage_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "provider" character varying(50) NOT NULL,
        "organization_id" uuid,
        "user_id" uuid,
        "endpoint" character varying(100) NOT NULL,
        "model" character varying(50),
        "input_tokens" integer NOT NULL DEFAULT 0,
        "output_tokens" integer NOT NULL DEFAULT 0,
        "total_tokens" integer NOT NULL DEFAULT 0,
        "cost" numeric(10,6) NOT NULL DEFAULT 0,
        "response_time_ms" integer NOT NULL DEFAULT 0,
        "success" boolean NOT NULL DEFAULT true,
        "error_message" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_usage_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_api_usage_logs_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for efficient querying
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_api_usage_logs_provider_created"
      ON "api_usage_logs" ("provider", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_api_usage_logs_org_created"
      ON "api_usage_logs" ("organization_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_api_usage_logs_created"
      ON "api_usage_logs" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_api_usage_logs_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_api_usage_logs_org_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_api_usage_logs_provider_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "api_usage_logs"`);
  }
}
