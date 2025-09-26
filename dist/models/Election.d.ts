import mongoose, { Document } from 'mongoose';
import { ElectionStatus } from '../types';
export interface IElection extends Document {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    status: ElectionStatus;
    createdAt: Date;
}
declare const _default: mongoose.Model<IElection, {}, {}, {}, mongoose.Document<unknown, {}, IElection, {}, {}> & IElection & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
