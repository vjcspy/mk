import supertest from 'supertest';

import { app } from '@/app';

describe('Routing Health', () => {
  it('should return `ok` when GET health check', async () => {
    const response = await supertest(app).get('/health');

    expect(response.statusCode).toEqual(200);
    expect(response.body.msg).toEqual('ok');
  });
});
