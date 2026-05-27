import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthGuard } from './guards/auth/auth.guard'; // Import cái Guard vừa viết

@Controller('auth') // Tiền tố của route sẽ là /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') // Định nghĩa route POST /auth/register
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login') // Định nghĩa route POST /auth/login
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // API Nội bộ: Cần có Token mới vào được
  @UseGuards(AuthGuard) // Kích hoạt "Khiên bảo vệ" cho riêng API này (Tương tự ->middleware('auth:api') bên Laravel)
  @Get('profile')
  getProfile(@Request() req) {
    // Thao tác lấy User từ request ra (Tương đương Auth::user() bên Laravel)
    return req.user;
  }
}