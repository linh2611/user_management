import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Biến module này thành Toàn cục, các module khác cứ thế mà dùng, không cần import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
