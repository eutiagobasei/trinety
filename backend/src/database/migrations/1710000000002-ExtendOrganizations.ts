import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendOrganizations1710000000002 implements MigrationInterface {
  name = 'ExtendOrganizations1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to organizations table
    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "plan_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "settings" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "logo_url" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "billing_email" character varying
    `);

    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD COLUMN IF NOT EXISTS "deactivated_at" TIMESTAMP
    `);

    // Add foreign key to plans
    await queryRunner.query(`
      ALTER TABLE "organizations"
      ADD CONSTRAINT "FK_organizations_plan"
      FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL
    `);

    // Create index on is_active
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_organizations_is_active" ON "organizations" ("is_active")
    `);

    // Set default plan (free) for existing organizations
    const freePlan = await queryRunner.query(`SELECT id FROM plans WHERE code = 'free' LIMIT 1`);
    if (freePlan && freePlan[0]) {
      await queryRunner.query(`
        UPDATE "organizations" SET "plan_id" = $1 WHERE "plan_id" IS NULL
      `, [freePlan[0].id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_organizations_is_active"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT IF EXISTS "FK_organizations_plan"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "deactivated_at"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "billing_email"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "logo_url"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "settings"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "plan_id"`);
    await queryRunner.query(`ALTER TABLE "organizations" DROP COLUMN IF EXISTS "is_active"`);
  }
}
