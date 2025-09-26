import mongoose, { Document } from 'mongoose';
export interface IVote extends Document {
    userId: mongoose.Types.ObjectId;
    electionId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    pollingStationId?: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVote, {}, {}, {}, mongoose.Document<unknown, {}, IVote, {}, {}> & IVote & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
