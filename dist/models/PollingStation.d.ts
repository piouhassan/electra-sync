import mongoose, { Document } from 'mongoose';
export interface IPollingStation extends Document {
    name: string;
    location?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IPollingStation, {}, {}, {}, mongoose.Document<unknown, {}, IPollingStation, {}, {}> & IPollingStation & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
