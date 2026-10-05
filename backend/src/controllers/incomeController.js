import Income from '../models/Income.js'

export async function getIncomeEntries(req, res) {
  try {
    const incomeEntries = await Income.find({ user: req.user._id }).sort({ receivedOn: -1, createdAt: -1 })
    return res.status(200).json({ incomeEntries })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch income.' })
  }
}

export async function createIncomeEntry(req, res) {
  try {
    const { title, amount, category, transactionType, receivedOn, description } = req.body

    if (!title?.trim() || !category?.trim() || !transactionType?.trim() || !receivedOn) {
      return res.status(400).json({ message: 'Title, category, transaction type, and date are required.' })
    }

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than zero.' })
    }

    const incomeEntry = await Income.create({
      user: req.user._id,
      title: title.trim(),
      amount: parsedAmount,
      category: category.trim(),
      transactionType: transactionType.trim(),
      receivedOn,
      description: description?.trim() ?? '',
    })

    return res.status(201).json({
      message: 'Income added successfully.',
      incomeEntry,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create income.' })
  }
}

export async function updateIncomeEntry(req, res) {
  try {
    const { title, amount, category, transactionType, receivedOn, description } = req.body

    if (!title?.trim() || !category?.trim() || !transactionType?.trim() || !receivedOn) {
      return res.status(400).json({ message: 'Title, category, transaction type, and date are required.' })
    }

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a number greater than zero.' })
    }

    const incomeEntry = await Income.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        title: title.trim(),
        amount: parsedAmount,
        category: category.trim(),
        transactionType: transactionType.trim(),
        receivedOn,
        description: description?.trim() ?? '',
      },
      {
        new: true,
        runValidators: true,
      },
    )

    if (!incomeEntry) {
      return res.status(404).json({ message: 'Income not found.' })
    }

    return res.status(200).json({
      message: 'Income updated successfully.',
      incomeEntry,
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update income.' })
  }
}

export async function deleteIncomeEntry(req, res) {
  try {
    const incomeEntry = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })

    if (!incomeEntry) {
      return res.status(404).json({ message: 'Income not found.' })
    }

    return res.status(200).json({ message: 'Income deleted successfully.' })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to delete income.' })
  }
}
