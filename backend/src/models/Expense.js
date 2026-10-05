import mongoose from 'mongoose'

const expenseSchema = new mongoose.Schema(
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
    spentOn: {
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

const Expense = mongoose.model('Expense', expenseSchema)

export default Expense
