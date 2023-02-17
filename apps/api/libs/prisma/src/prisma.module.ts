import { FooRepo } from '@lib/prisma/repository/foo.repo';
import { PrismaService } from '@lib/prisma/service/prisma.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [PrismaService, FooRepo],
  exports: [PrismaService, FooRepo],
})
export class PrismaModule {}
