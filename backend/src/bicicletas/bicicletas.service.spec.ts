import { Test, TestingModule } from '@nestjs/testing';
import { BicicletasService } from './bicicletas.service';

describe('BicicletasService', () => {
  let service: BicicletasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BicicletasService],
    }).compile();

    service = module.get<BicicletasService>(BicicletasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
