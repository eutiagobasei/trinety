import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { DataSource } from 'typeorm';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database?: 'connected' | 'disconnected';
  version?: string;
}

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const healthStatus: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    try {
      await this.dataSource.query('SELECT 1');
      healthStatus.database = 'connected';
    } catch {
      healthStatus.status = 'error';
      healthStatus.database = 'disconnected';
    }

    return healthStatus;
  }

  @Get('live')
  liveness(): { status: string } {
    return { status: 'ok' };
  }

  @Get('ready')
  async readiness(): Promise<{ status: string; ready: boolean }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', ready: true };
    } catch {
      return { status: 'error', ready: false };
    }
  }
}
