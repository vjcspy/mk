import type { Request, Response } from 'express';

export const getInfoController = (_req: Request, res: Response) => {
  console.log('getInfoController');
  res.json(_req.headers);
};
