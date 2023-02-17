import type { Request, Response } from 'express';

import {
  SLACK_MISSING_CONFIGURATION_ERROR,
  SLACK_MISSING_POST_MESSAGE_SECRET_ERROR,
  SLACK_UNAUTHORIZED_POST_MESSAGE_ERROR,
  UNKNOWN_ERROR,
} from '@/cfg/error-type';
import { initializeSlack, postMessage } from '@/service/slack';

export const slackPostMessageController = async (
  req: Request,
  res: Response
) => {
  if (!initializeSlack()) {
    return res.status(400).json({ error: SLACK_MISSING_CONFIGURATION_ERROR });
  }

  const postMessageSecret = process.env.SLACK_POST_MESSAGE_SECRET;

  if (!postMessageSecret) {
    return res
      .status(400)
      .json({ error: SLACK_MISSING_POST_MESSAGE_SECRET_ERROR });
  }

  const { token, options } = req.body;

  if (token !== postMessageSecret) {
    return res
      .status(401)
      .json({ error: SLACK_UNAUTHORIZED_POST_MESSAGE_ERROR });
  }

  try {
    await postMessage(options);
  } catch (e) {
    return res
      .status(400)
      .json({ error: e instanceof Error ? e.message : UNKNOWN_ERROR });
  }

  return res.json({
    msg: 'ok',
  });
};
