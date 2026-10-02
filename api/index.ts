import type { Request, Response } from 'express';
import app from '../server';

// Serverless Handler for Vercel deployment
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
