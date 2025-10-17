import { TenantMiddleware } from './tenant.middleware';
import { ConfigService } from '@nestjs/config';

describe('TenantMiddleware', () => {
  it('should be defined', () => {
    const mockConfigService = {
      get: jest.fn(),
    } as unknown as ConfigService;

    expect(new TenantMiddleware(mockConfigService)).toBeDefined();
  });
});
