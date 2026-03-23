import { Test, TestingModule } from '@nestjs/testing';
import { BicicletasController } from './bicicletas.controller';
import { BicicletasService } from './bicicletas.service';

describe('BicicletasController', () => {
  let controller: BicicletasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BicicletasController],
      providers: [BicicletasService],
    }).compile();

    controller = module.get<BicicletasController>(BicicletasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
