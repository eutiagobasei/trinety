import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Organization } from '../database/entities/organization.entity';
import { User } from '../database/entities/user.entity';
import { UserOrganization } from '../database/entities/user-organization.entity';
import { Plan } from '../database/entities/plan.entity';
import { PlanFeature } from '../database/entities/plan-feature.entity';
import { ApiKey } from '../database/entities/api-key.entity';
import { SystemSetting } from '../database/entities/system-setting.entity';
import { ApiUsageLog } from '../database/entities/api-usage-log.entity';

// Services
import { AdminOrganizationsService } from './services/admin-organizations.service';
import { AdminPlansService } from './services/admin-plans.service';
import { AdminApiKeysService } from './services/admin-api-keys.service';
import { AdminSettingsService } from './services/admin-settings.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { EncryptionService } from '../common/services/encryption.service';

// Controllers
import { AdminOrganizationsController } from './controllers/admin-organizations.controller';
import { AdminPlansController } from './controllers/admin-plans.controller';
import { AdminApiKeysController } from './controllers/admin-api-keys.controller';
import { AdminSettingsController } from './controllers/admin-settings.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      User,
      UserOrganization,
      Plan,
      PlanFeature,
      ApiKey,
      SystemSetting,
      ApiUsageLog,
    ]),
  ],
  controllers: [
    AdminOrganizationsController,
    AdminPlansController,
    AdminApiKeysController,
    AdminSettingsController,
    AdminDashboardController,
  ],
  providers: [
    AdminOrganizationsService,
    AdminPlansService,
    AdminApiKeysService,
    AdminSettingsService,
    AdminDashboardService,
    EncryptionService,
  ],
  exports: [
    AdminApiKeysService,
    AdminSettingsService,
    EncryptionService,
  ],
})
export class SuperAdminModule {}
