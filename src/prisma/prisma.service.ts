import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Lấy chuỗi kết nối từ file .env
    const connectionString = process.env.DATABASE_URL || "postgresql://myuser:mypassword@localhost:5433/mydatabase?schema=public";

    // 2. Tạo một Connection Pool bằng thư viện 'pg' thuần
    const pool = new Pool({ connectionString });

    // 3. Biến đổi Pool này thành Adapter tương thích với Prisma v7
    const adapter = new PrismaPg(pool);

    // 4. Truyền adapter vào hàm khởi tạo gốc đúng theo yêu cầu của Prisma v7
    super({ adapter });
  }

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$connect(); 
  }
}