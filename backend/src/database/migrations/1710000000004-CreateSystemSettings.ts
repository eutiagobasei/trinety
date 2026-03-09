import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemSettings1710000000004 implements MigrationInterface {
  name = 'CreateSystemSettings1710000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for value type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "setting_value_type_enum" AS ENUM ('string', 'number', 'boolean', 'json');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);

    // Create system_settings table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" character varying(100) NOT NULL,
        "value" text NOT NULL,
        "value_type" "setting_value_type_enum" NOT NULL DEFAULT 'string',
        "description" text,
        "is_public" boolean NOT NULL DEFAULT false,
        "category" character varying(50),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_system_settings_key" UNIQUE ("key")
      )
    `);

    // Insert default settings
    await queryRunner.query(`
      INSERT INTO "system_settings" ("key", "value", "value_type", "description", "is_public", "category") VALUES
      ('app_name', 'Trinity Hub', 'string', 'Nome da aplicação', true, 'general'),
      ('app_description', 'Plataforma de Planejamento Estratégico', 'string', 'Descrição da aplicação', true, 'general'),
      ('maintenance_mode', 'false', 'boolean', 'Modo de manutenção ativo', false, 'general'),
      ('default_plan', 'free', 'string', 'Código do plano padrão para novos cadastros', false, 'billing'),
      ('allow_registration', 'true', 'boolean', 'Permitir novos registros', false, 'security'),
      ('max_login_attempts', '5', 'number', 'Máximo de tentativas de login antes do bloqueio', false, 'security'),
      ('ai_model', 'gpt-4-turbo-preview', 'string', 'Modelo de IA padrão', false, 'ai'),
      ('ai_max_tokens', '4000', 'number', 'Máximo de tokens por requisição IA', false, 'ai')
      ON CONFLICT ("key") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "system_settings"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "setting_value_type_enum"`);
  }
}
