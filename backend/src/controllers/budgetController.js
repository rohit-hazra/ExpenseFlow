export function getBudget(req, res) {
  return res.status(200).json({
    budget: {
      monthlyBudget: req.user.monthlyBudget ?? 30000,
    },
  })
}

export async function updateBudget(req, res) {
  try {
    const monthlyBudget = Number(req.body.monthlyBudget)

    if (!Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
      return res.status(400).json({ message: 'Please enter a valid monthly budget.' })
    }

    req.user.monthlyBudget = monthlyBudget
    await req.user.save()

    return res.status(200).json({
      message: 'Monthly budget updated successfully.',
      budget: {
        monthlyBudget: req.user.monthlyBudget,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update budget.' })
  }
}
