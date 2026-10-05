import Expense from '../models/Expense.js'

export async function getExpenses(req, res) {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ spentOn: -1, createdAt: -1 })
    return res.status(200).json({ expenses })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch expenses.' })
  }
}

export async function createExpense(req, res) {
  try {
    const { title, amount, category, transactionType, spentOn, description } = req.body

    if (!title?.trim() || !category?.trim() || !transactionType?.trim() || !spentOn) {
      return res.status(400).json({ message: 'Title, category, transaction type, and date are required.' })
    }

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than zero.' })
    }

    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: parsedAmount,
      category: category.trim(),
      transactionType: transactionType.trim(),
      spentOn,
      description: description?.trim() ?? '',
    })

    return res.status(201).json({
      message: 'Expense added successfully.',
      expense,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create expense.' })
  }
}

export async function updateExpense(req, res) {
  try {
    const { title, amount, category, transactionType, spentOn, description } = req.body

    if (!title?.trim() || !category?.trim() || !transactionType?.trim() || !spentOn) {
      return res.status(400).json({ message: 'Title, category, transaction type, and date are required.' })
    }

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than zero.' })
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim(),
        transactionType: transactionType.trim(),
        spentOn,
        description: description?.trim() ?? '',
      },
      {
        new: true,
        runValidators: true,
      },
    )

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' })
    }

    return res.status(200).json({
      message: 'Expense updated successfully.',
      expense,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update expense.' })
  }
}

export async function deleteExpense(req, res) {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' })
    }

    return res.status(200).json({ message: 'Expense deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete expense.' })
  }
}
