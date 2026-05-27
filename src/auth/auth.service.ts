import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // Inject Prisma và JwtService vào qua constructor (Dependency Injection)
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Kiểm tra email trùng
    const userExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (userExists) throw new BadRequestException('Email này đã được sử dụng!');

    // 2. Hash mật khẩu (Bcrypt)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Tạo User mới và mặc định gán Role "USER" (Nếu chưa có role thì tạo tạm)
    let userRole = await this.prisma.role.findUnique({ where: { name: 'USER' } });
    if (!userRole) {
      userRole = await this.prisma.role.create({ data: { name: 'USER' } });
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        roles: {
          create: { roleId: userRole.id }
        }
      },
    });

    return { message: 'Đăng ký thành công', userId: newUser.id };
  }

  async login(dto: LoginDto) {
    // 1. Kiểm tra user tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } } // Kéo theo thông tin Role luôn (như Eager Loading `with('roles')` bên Laravel)
    });
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');

    // 3. Cấu trúc dữ liệu muốn đưa vào Token (Payload)
    const userRoles = user.roles.map(r => r.role.name);
    const payload = { sub: user.id, email: user.email, roles: userRoles };

    // 4. Ký token và trả về cho client
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name, roles: userRoles }
    };
  }
}