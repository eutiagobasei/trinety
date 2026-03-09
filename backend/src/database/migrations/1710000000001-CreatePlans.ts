import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlans1710000000001 implements MigrationInterface {
  name = 'CreatePlans1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create plans table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(50) NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "monthly_price" numeric(10,2) NOT NULL DEFAULT 0,
        "yearly_price" numeric(10,2) NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plans" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_plans_code" UNIQUE ("code")
      )
    `);

    // Create plan_features table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plan_features" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "plan_id" uuid NOT NULL,
        "feature_key" character varying(100) NOT NULL,
        "value" character varying(255) NOT NULL,
        "description" text,
        CONSTRAINT "PK_plan_features" PRIMARY KEY ("id"),
        CONSTRAINT "FK_plan_features_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE
      )
    `);

    // Insert default plans
    await queryRunner.query(`
      INSERT INTO "plans" ("code", "name", "description", "monthly_price", "yearly_price", "sort_order") VALUES
      ('free', 'Gratuito', 'Plano gratuito com funcionalidades básicas para teste', 0, 0, 0),
      ('starter', 'Starter', 'Ideal para pequenas equipes começando o planejamento estratégico', 49.90, 479.00, 1),
      ('pro', 'Professional', 'Para equipes em crescimento que precisam de mais recursos', 99.90, 959.00, 2),
      ('enterprise', 'Enterprise', 'Solução completa para empresas com necessidades avançadas', 249.90, 2399.00, 3)
      ON CONFLICT ("code") DO NOTHING
    `);

    // Get plan IDs
    const plans = await queryRunner.query(`SELECT id, code FROM plans`);
    const planMap = Object.fromEntries(plans.map((p: any) => [p.code, p.id]));

    // Insert default features for each plan
    const features = [
      // Free plan
      { planId: planMap['free'], featureKey: 'max_users', value: '2', description: 'Máximo de usuários' },
      { planId: planMap['free'], featureKey: 'ai_enabled', value: 'false', description: 'Geração com IA' },
      { planId: planMap['free'], featureKey: 'api_calls_per_month', value: '0', description: 'Chamadas de API por mês' },
      { planId: planMap['free'], featureKey: 'export_pdf', value: 'false', description: 'Exportar para PDF' },
      { planId: planMap['free'], featureKey: 'support_level', value: 'community', description: 'Nível de suporte' },

      // Starter plan
      { planId: planMap['starter'], featureKey: 'max_users', value: '5', description: 'Máximo de usuários' },
      { planId: planMap['starter'], featureKey: 'ai_enabled', value: 'true', description: 'Geração com IA' },
      { planId: planMap['starter'], featureKey: 'api_calls_per_month', value: '100', description: 'Chamadas de API por mês' },
      { planId: planMap['starter'], featureKey: 'export_pdf', value: 'true', description: 'Exportar para PDF' },
      { planId: planMap['starter'], featureKey: 'support_level', value: 'email', description: 'Nível de suporte' },

      // Pro plan
      { planId: planMap['pro'], featureKey: 'max_users', value: '20', description: 'Máximo de usuários' },
      { planId: planMap['pro'], featureKey: 'ai_enabled', value: 'true', description: 'Geração com IA' },
      { planId: planMap['pro'], featureKey: 'api_calls_per_month', value: '500', description: 'Chamadas de API por mês' },
      { planId: planMap['pro'], featureKey: 'export_pdf', value: 'true', description: 'Exportar para PDF' },
      { planId: planMap['pro'], featureKey: 'support_level', value: 'priority', description: 'Nível de suporte' },
      { planId: planMap['pro'], featureKey: 'custom_branding', value: 'true', description: 'Logo personalizado' },

      // Enterprise plan
      { planId: planMap['enterprise'], featureKey: 'max_users', value: 'unlimited', description: 'Máximo de usuários' },
      { planId: planMap['enterprise'], featureKey: 'ai_enabled', value: 'true', description: 'Geração com IA' },
      { planId: planMap['enterprise'], featureKey: 'api_calls_per_month', value: 'unlimited', description: 'Chamadas de API por mês' },
      { planId: planMap['enterprise'], featureKey: 'export_pdf', value: 'true', description: 'Exportar para PDF' },
      { planId: planMap['enterprise'], featureKey: 'support_level', value: 'dedicated', description: 'Nível de suporte' },
      { planId: planMap['enterprise'], featureKey: 'custom_branding', value: 'true', description: 'Logo personalizado' },
      { planId: planMap['enterprise'], featureKey: 'sso', value: 'true', description: 'Single Sign-On' },
      { planId: planMap['enterprise'], featureKey: 'api_access', value: 'true', description: 'Acesso à API' },
    ];

    for (const feature of features) {
      if (feature.planId) {
        await queryRunner.query(`
          INSERT INTO "plan_features" ("plan_id", "feature_key", "value", "description")
          VALUES ($1, $2, $3, $4)
        `, [feature.planId, feature.featureKey, feature.value, feature.description]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "plan_features"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "plans"`);
  }
}
