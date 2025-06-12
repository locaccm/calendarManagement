import { Event as PrismaEvent } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      event?: PrismaEvent;
    }
  }
}
