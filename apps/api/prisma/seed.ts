// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SEED = 1000;

const fakeFoo = async () => {
  await prisma.foo.create({
    data: {
      name: faker.internet.userName(),
      email: faker.internet.email(),
    },
  });
};
async function main() {
  // eslint-disable-next-line array-callback-return
  Array.from({ length: DEFAULT_SEED }, () => {
    fakeFoo();
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
