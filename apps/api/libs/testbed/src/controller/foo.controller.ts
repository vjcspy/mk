import { FooRepo } from '@lib/prisma/repository/foo.repo';
import { Controller, Get, Param } from '@nestjs/common';
import type { Foo } from '@prisma/client';

@Controller()
export class FooController {
  constructor(private readonly fooRepo: FooRepo) {}

  @Get('foo/:id')
  async getPostById(@Param('id') id: string): Promise<Foo> {
    return this.fooRepo.foo({ id: Number(id) });
  }
}
