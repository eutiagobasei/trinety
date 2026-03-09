import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DataSource } from 'typeorm';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DataSource,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return ok status when database is connected', async () => {
      (dataSource.query as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.database).toBe('connected');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return error status when database is disconnected', async () => {
      (dataSource.query as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.database).toBe('disconnected');
    });
  });

  describe('liveness', () => {
    it('should return ok status', () => {
      const result = controller.liveness();
      expect(result.status).toBe('ok');
    });
  });

  describe('readiness', () => {
    it('should return ready true when database is available', async () => {
      (dataSource.query as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.readiness();

      expect(result.status).toBe('ok');
      expect(result.ready).toBe(true);
    });

    it('should return ready false when database is unavailable', async () => {
      (dataSource.query as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      const result = await controller.readiness();

      expect(result.status).toBe('error');
      expect(result.ready).toBe(false);
    });
  });
});
