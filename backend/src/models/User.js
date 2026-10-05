import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    monthlyBudget: {
      type: Number,
      default: 30000,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)

export default User
