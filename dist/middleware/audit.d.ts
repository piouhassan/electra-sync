import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../types';
interface AuthRequest extends Request {
    user?: JwtPayload;
}
export declare const auditLogger: (action: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
