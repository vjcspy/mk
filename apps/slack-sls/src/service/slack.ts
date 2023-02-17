import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import { find } from 'lodash';

import { SLACK_CHANNEL_NOT_FOUND_ERROR } from '@/cfg/error-type';
import { Registry } from '@/service/registry';

const SLACK_CHANNEL_CACHE_KEY = 'SLACK_CHANNEL_CACHE_KEY';

// Each workspace have an authenticate token
let boltApp: App;

// Receiver to handler event from Slack.
let receiver: ExpressReceiver;

export const initializeSlack = () => {
  if (!process.env.SLACK_SIGNING_SECRET || !process.env.SLACK_BOT_TOKEN) {
    return undefined;
  }

  try {
    if (!boltApp || !receiver) {
      receiver = new ExpressReceiver({
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        endpoints: '/',
      });

      boltApp = new App({
        token: process.env.SLACK_BOT_TOKEN,
        receiver,
        logLevel: LogLevel.DEBUG,
      });
    }

    return {
      boltApp,
      receiver,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const getRegisteredChannel = async () => {
  if (!Registry.registry(SLACK_CHANNEL_CACHE_KEY)) {
    const slack = initializeSlack();
    let channels: any[] = [];

    if (slack?.boltApp?.client) {
      const { client } = slack.boltApp;
      const r = await client.conversations.list();
      channels = Array.isArray(r?.channels) ? r.channels : [];
    }

    Registry.register(SLACK_CHANNEL_CACHE_KEY, channels);
  }

  return Registry.registry(SLACK_CHANNEL_CACHE_KEY);
};

export const postMessage: any = async (options: any) => {
  let channelId: string;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { channel_id, channel_name, ...messageOptions } = options;

  if (channel_id) {
    channelId = channel_id;
  } else if (channel_name) {
    const registeredChannels = await getRegisteredChannel();
    const channel = find(
      registeredChannels,
      (_rc) => _rc?.name === options?.channel_name
    );

    if (channel?.id) {
      channelId = channel.id;
    }
  }
  // @ts-ignore
  if (!channelId) {
    throw new Error(SLACK_CHANNEL_NOT_FOUND_ERROR);
  }

  const slack = initializeSlack();
  if (slack?.boltApp?.client) {
    const { client } = slack.boltApp;
    try {
      return await client.chat.postMessage({
        channel: channelId,
        ...messageOptions,
      });
    } catch (e) {
      throw new Error(`Error Post message to channel ${channelId}`);
    }
  } else {
    throw new Error('SLACK_ERROR');
  }
};
