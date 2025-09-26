import mongoose, { Document } from 'mongoose';
import { Role } from '../types';
export interface IUser extends Document {
    name: string;
    email: string;
    code: string;
    role: Role;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
