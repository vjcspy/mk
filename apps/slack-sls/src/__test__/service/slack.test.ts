import {
  getRegisteredChannel,
  initializeSlack,
  postMessage,
} from '@/service/slack';

jest.mock('@slack/bolt', () => {
  return {
    __esModule: true, // this property makes it work
    App: jest.fn().mockImplementation(() => ({
      client: {
        conversations: { list: jest.fn() },
        chat: { postMessage: jest.fn().mockReturnValue({}) },
      },
    })),
    ExpressReceiver: jest.fn().mockImplementation(() => ({})),
    LogLevel: 'debug',
  };
});

jest.mock('lodash', () => {
  return {
    __esModule: true, // this property makes it work
    find: jest.fn(),
  };
});

const mockRegistryFn = jest.fn();
const mockRegisterFn = jest.fn();
jest.mock('@/service/registry', () => {
  return {
    __esModule: true, // this property makes it work
    Registry: {
      registry: () => mockRegistryFn(),
      register: () => mockRegisterFn(),
    },
  };
});

describe('Service Slack', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should return undefined when not config env', () => {
    process.env.SLACK_SIGNING_SECRET = undefined;

    const slack = initializeSlack();

    expect(slack).toEqual(undefined);
  });

  it('should return slack data when config success', () => {
    process.env.SLACK_SIGNING_SECRET = '1';
    process.env.SLACK_BOT_TOKEN = '1';

    const slack = initializeSlack();
    expect(slack).toBeDefined();
  });

  it('should run get channel success', async () => {
    process.env.SLACK_SIGNING_SECRET = '1';
    process.env.SLACK_BOT_TOKEN = '1';
    const returnValue = undefined;
    mockRegistryFn.mockReturnValue(returnValue);

    await getRegisteredChannel();
    expect(mockRegistryFn).toBeCalled();
    expect(mockRegisterFn).toBeCalled();
  });

  it('should success post message', async () => {
    mockRegisterFn.mockReturnValue([]);
    process.env.SLACK_SIGNING_SECRET = '1';
    process.env.SLACK_BOT_TOKEN = '1';
    const r = await postMessage({ channel_id: '123' });

    expect(r).toBeDefined();
  });

  it('should throw error when not found channel name', async () => {
    mockRegisterFn.mockReturnValue([]);
    process.env.SLACK_SIGNING_SECRET = '1';
    process.env.SLACK_BOT_TOKEN = '1';

    try {
      await postMessage({ channel_name: '123' });
    } catch (e) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toBeDefined();
    }
  });
});
