import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeys1710000000003 implements MigrationInterface {
  name = 'CreateApiKeys1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create api_keys table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "api_keys" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "provider" character varying(50) NOT NULL,
        "display_name" character varying(100) NOT NULL,
        "encrypted_key" text NOT NULL,
        "key_prefix" character varying(20),
        "is_active" boolean NOT NULL DEFAULT true,
        "last_used_at" TIMESTAMP,
        "usage_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_api_keys_provider" UNIQUE ("provider")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "api_keys"`);
  }
}
