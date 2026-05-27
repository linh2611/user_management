import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Biến JwtService thành toàn cục để các module khác dùng chung luôn
      secret: 'MY_SUPER_SECRET_KEY_2026', // Trong thực tế cái này nên để ở file .env
      signOptions: { expiresIn: '1d' }, // Token hết hạn sau 1 ngày
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}