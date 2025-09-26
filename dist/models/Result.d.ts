import mongoose, { Document } from 'mongoose';
export interface IResult extends Document {
    electionId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    totalVotes: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IResult, {}, {}, {}, mongoose.Document<unknown, {}, IResult, {}, {}> & IResult & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
