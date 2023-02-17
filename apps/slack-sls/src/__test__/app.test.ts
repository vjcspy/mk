import supertest from 'supertest';

import { app } from '@/app';

jest.mock('@/service/slack', () => {
  return {
    __esModule: true, // this property makes it work
    initializeSlack: jest
      .fn()
      .mockReturnValue({ receiver: { app: jest.fn() } }),
  };
});

describe('Express app', () => {
  describe('Routing', () => {
    beforeEach(() => {
      jest.resetModules(); // Most important - it clears the cache
    });

    it('should return `Serverless + Slack` when GET index', async () => {
      const response = await supertest(app).get('/');

      expect(response.statusCode).toEqual(200);
      expect(response.body.msg).toEqual('Serverless + Slack');
    });

    it('should return `NOT FOUND` when GET a not found route', async () => {
      const response = await supertest(app).get('/random-page');

      expect(response.statusCode).toEqual(404);
      expect(response.body.error).toEqual('NOT FOUND');
    });
  });
});
