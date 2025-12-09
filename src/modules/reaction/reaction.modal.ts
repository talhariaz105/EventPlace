import { IReactionModal } from './reaction.interfaces';
import mongoose, { Schema } from 'mongoose';

const ReactionSchema = new Schema<IReactionModal>(
  {
    messageId: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

const Reaction = mongoose.model<IReactionModal>('Reaction', ReactionSchema);

export default Reaction;
