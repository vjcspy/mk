import { PrismaService } from '@lib/prisma/service/prisma.service';
import { Injectable } from '@nestjs/common';
import type { Foo, Prisma } from '@prisma/client';

@Injectable()
export class FooRepo {
  constructor(private prisma: PrismaService) {}

  async foo(
    userWhereUniqueInput: Prisma.FooWhereUniqueInput,
  ): Promise<Foo | null> {
    return this.prisma.foo.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async foos(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.FooWhereUniqueInput;
    where?: Prisma.FooWhereInput;
    orderBy?: Prisma.FooOrderByWithRelationInput;
  }): Promise<Foo[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.foo.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createFoo(data: Prisma.FooCreateInput): Promise<Foo> {
    return this.prisma.foo.create({
      data,
    });
  }

  async updateFoo(params: {
    where: Prisma.FooWhereUniqueInput;
    data: Prisma.FooUpdateInput;
  }): Promise<Foo> {
    const { where, data } = params;
    return this.prisma.foo.update({
      data,
      where,
    });
  }

  async deleteFoo(where: Prisma.FooWhereUniqueInput): Promise<Foo> {
    return this.prisma.foo.delete({
      where,
    });
  }
}
