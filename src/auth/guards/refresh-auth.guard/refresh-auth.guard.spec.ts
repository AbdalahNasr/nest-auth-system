import { Test, TestingModule } from '@nestjs/testing';
import { RefreshAuthGuard } from './refresh-auth.guard';

describe('RefreshAuthGuard', () => {
  let provider: RefreshAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshAuthGuard],
    }).compile();

    provider = module.get<RefreshAuthGuard>(RefreshAuthGuard);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
