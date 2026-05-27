import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  // Inject JwtService vào để dùng hàm verify token
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Lấy đối tượng Request từ Context của NestJS (Giống đối tượng $request trong Laravel)
    const request = context.switchToHttp().getRequest<Request>();
    
    // 2. Bóc tách chuỗi Token từ Header "Authorization: Bearer <token>"
    const token = this.extractTokenFromHeader(request);
    
    // 3. Nếu không tìm thấy token, chặn lại luôn
    if (!token) {
      throw new UnauthorizedException('Bạn cần đăng nhập để thực hiện thao tác này!');
    }

    try {
      // 4. Giải mã và kiểm tra token (Sửa 'payload' thành 'token' ở dòng dưới)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'MY_SUPER_SECRET_KEY_2026', 
      });
      
      // 5. Gán thông tin User đã giải mã ngược vào object request
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn!');
    }
    
    return true; // Cho phép đi tiếp vào Controller
  }

  // Hàm phụ trợ để cắt chuỗi lấy Token từ Header
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}