import mongoose, { Document } from 'mongoose';
export interface ICandidate extends Document {
    name: string;
    electionId: mongoose.Types.ObjectId;
    pollingStationId?: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICandidate, {}, {}, {}, mongoose.Document<unknown, {}, ICandidate, {}, {}> & ICandidate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
