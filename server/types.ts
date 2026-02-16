import { Session } from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export interface AuthenticatedRequest extends Express.Request {
  session: Session & {
    userId?: string;
  };
}