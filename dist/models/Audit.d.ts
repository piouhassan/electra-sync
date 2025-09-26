import mongoose, { Document } from 'mongoose';
export interface IAudit extends Document {
    userId?: mongoose.Types.ObjectId;
    action: string;
    actionDate: Date;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
}
declare const _default: mongoose.Model<IAudit, {}, {}, {}, mongoose.Document<unknown, {}, IAudit, {}, {}> & IAudit & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
