import {
  SLACK_MISSING_CONFIGURATION_ERROR,
  SLACK_MISSING_POST_MESSAGE_SECRET_ERROR,
  SLACK_UNAUTHORIZED_POST_MESSAGE_ERROR,
  UNKNOWN_ERROR,
} from '@/cfg/error-type';
import { slackPostMessageController } from '@/controller/slack/post-message';

const mockInitializeSlackFn = jest.fn();
const mockPostMessageFn = jest.fn();

jest.mock('@/service/slack', () => {
  return {
    __esModule: true, // this property makes it work
    initializeSlack: () => mockInitializeSlackFn(),
    postMessage: () => mockPostMessageFn(),
  };
});

describe('Routing Post Message', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
    mockInitializeSlackFn.mockClear();
    mockPostMessageFn.mockClear();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should return 400 when slack not initialized', async () => {
    mockInitializeSlackFn.mockReturnValue(undefined);
    const mReq = {};
    const mRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await slackPostMessageController(mReq as any, mRes as any);
    expect(mockPostMessageFn).not.toHaveBeenCalled();
    expect(mRes.status).toHaveBeenCalledWith(400);
    expect(mRes.json).toHaveBeenCalledWith({
      error: SLACK_MISSING_CONFIGURATION_ERROR,
    });
  });

  it('should return 400 when not config secret', async () => {
    mockInitializeSlackFn.mockReturnValue({});
    process.env.SLACK_POST_MESSAGE_SECRET = undefined;

    const mReq = { token: '123' };
    const mRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await slackPostMessageController(mReq as any, mRes as any);
    expect(mockPostMessageFn).not.toHaveBeenCalled();
    expect(mRes.status).toHaveBeenCalledWith(400);
    expect(mRes.json).toHaveBeenCalledWith({
      error: SLACK_MISSING_POST_MESSAGE_SECRET_ERROR,
    });
  });

  it('should return 401 when wrong secret', async () => {
    mockInitializeSlackFn.mockReturnValue({});
    const mReq = { body: { token: '123' } };
    const mRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    process.env.SLACK_POST_MESSAGE_SECRET = '1234';
    await slackPostMessageController(mReq as any, mRes as any);
    expect(mockPostMessageFn).not.toHaveBeenCalled();
    expect(mRes.status).toHaveBeenCalledWith(401);
    expect(mRes.json).toHaveBeenCalledWith({
      error: SLACK_UNAUTHORIZED_POST_MESSAGE_ERROR,
    });
  });

  it('should return 400 when post message error', async () => {
    mockInitializeSlackFn.mockReturnValue({});
    mockPostMessageFn.mockRejectedValue(new Error(UNKNOWN_ERROR));
    const mReq = { body: { token: '123' } };
    const mRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    process.env.SLACK_POST_MESSAGE_SECRET = '123';
    await slackPostMessageController(mReq as any, mRes as any);
    expect(mockPostMessageFn).toHaveBeenCalled();
    expect(mRes.status).toHaveBeenCalledWith(400);
    expect(mRes.json).toHaveBeenCalledWith({
      error: UNKNOWN_ERROR,
    });
  });

  it('should return ok when post message success', async () => {
    mockInitializeSlackFn.mockReturnValue({});
    mockPostMessageFn.mockReturnThis();
    const mReq = { body: { token: '123' } };
    const mRes = { json: jest.fn() };
    process.env.SLACK_POST_MESSAGE_SECRET = '123';
    await slackPostMessageController(mReq as any, mRes as any);
    expect(mockPostMessageFn).toHaveBeenCalled();
    expect(mRes.json).toHaveBeenCalledWith({
      msg: 'ok',
    });
  });
});
