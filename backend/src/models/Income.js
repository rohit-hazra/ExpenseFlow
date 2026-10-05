import mongoose from 'mongoose'

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    transactionType: {
      type: String,
      required: true,
      trim: true,
      default: 'UPI',
    },
    receivedOn: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

const Income = mongoose.model('Income', incomeSchema)

export default Income
