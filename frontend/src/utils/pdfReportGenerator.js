import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

const virtualFileSystem = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts?.default || pdfFonts

if (typeof pdfMake.addVirtualFileSystem === 'function') {
  pdfMake.addVirtualFileSystem(virtualFileSystem)
}

pdfMake.vfs = virtualFileSystem

const PRIMARY_COLOR = '#f97316'
const SECONDARY_COLOR = '#0ea5e9'
const SUCCESS_COLOR = '#10b981'
const WARNING_COLOR = '#f59e0b'
const DANGER_COLOR = '#ef4444'
const TEXT_COLOR = '#1f2937'
const MUTED_COLOR = '#64748b'
const PANEL_COLOR = '#f8fafc'
const PANEL_BORDER = '#dbe4f0'

function clampMonths(value) {
  const parsedValue = Number(value)

  if (!Number.isFinite(parsedValue)) {
    return 6
  }

  return Math.min(Math.max(Math.trunc(parsedValue), 1), 6)
}

function startOfMonth(dateValue) {
  const date = new Date(dateValue)
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function endOfDay(dateValue) {
  const date = new Date(dateValue)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

function addMonths(dateValue, amount) {
  const date = new Date(dateValue)
  date.setMonth(date.getMonth() + amount)
  return date
}

function safeDate(dateValue) {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? null : date
}

function inRange(dateValue, startDate, endDate) {
  const date = safeDate(dateValue)

  if (!date) {
    return false
  }

  return date >= startDate && date <= endDate
}

function formatCurrency(value = 0) {
  const numericValue = Number(value || 0)

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(numericValue)
}

function formatReportCurrency(value = 0) {
  return `₹${formatCurrency(value)}`
}

function formatLongDate(dateValue) {
  const date = safeDate(dateValue)

  if (!date) {
    return 'N/A'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMonthYear(dateValue) {
  const date = safeDate(dateValue)

  if (!date) {
    return 'N/A'
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateValue) {
  const date = safeDate(dateValue)

  if (!date) {
    return 'N/A'
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatReportPeriod(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'N/A'
  }

  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return formatMonthYear(endDate)
  }

  return `${formatMonthYear(startDate)} - ${formatMonthYear(endDate)}`
}

function normalizeTransactionAmount(entry) {
  return Number(entry?.amount || 0)
}

// function getTransactionDate(entry) {
//   return safeDate(entry?.spentOn || entry?.receivedOn || entry?.createdAt)
// }

function getTransactionDate(entry) {
  return safeDate(entry?.date)
}

function combineTransactions(expenses = [], incomeEntries = [], startDate, endDate) {
  const expenseTransactions = (Array.isArray(expenses) ? expenses : [])
    .map((entry) => ({
      id: entry._id || entry.id,
      date: entry.spentOn || entry.createdAt,
      type: 'Expense',
      category: entry.category || 'Other',
      title: entry.title || 'Untitled',
      transactionType: entry.transactionType || '—',
      amount: normalizeTransactionAmount(entry),
    }))

  const incomeTransactions = (Array.isArray(incomeEntries) ? incomeEntries : [])
    .map((entry) => ({
      id: entry._id || entry.id,
      date: entry.receivedOn || entry.createdAt,
      type: 'Income',
      category: entry.category || 'Other',
      title: entry.title || 'Untitled',
      transactionType: entry.transactionType || '—',
      amount: normalizeTransactionAmount(entry),
    }))

  return [...expenseTransactions, ...incomeTransactions]
    .filter((entry) => inRange(entry.date, startDate, endDate))
    .sort((left, right) => {
      const rightDate = getTransactionDate(right)
      const leftDate = getTransactionDate(left)

      return (rightDate?.getTime() || 0) - (leftDate?.getTime() || 0)
    })
}

function groupTransactionsByCategory(transactions = []) {
  return transactions.reduce((grouped, transaction) => {
    const category = transaction.category || 'Other'
    grouped.set(category, (grouped.get(category) || 0) + normalizeTransactionAmount(transaction))
    return grouped
  }, new Map())
}

function getSortedCategoryRows(categoryMap) {
  return [...categoryMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount)
}

function buildCategoryRows(categoryMap) {
  const rows = getSortedCategoryRows(categoryMap)

  if (rows.length === 0) {
    return [
      [
        {
          text: 'No entries found in this period.',
          colSpan: 2,
          style: 'tableEmptyText',
        },
        {},
      ],
    ]
  }

  const bodyRows = rows.map((row) => ([
    {
      text: row.category,
      style: 'tableCell',
    },
    {
      text: formatReportCurrency(row.amount),
      style: 'tableCellRight',
    },
  ]))

  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0)

  bodyRows.push([
    {
      text: 'Total',
      style: 'tableTotalLabel',
    },
    {
      text: formatReportCurrency(totalAmount),
      style: 'tableTotalValue',
    },
  ])

  return bodyRows
}

function createSectionTitle(title, subtitle, accentColor = PRIMARY_COLOR) {
  return [
    {
      text: title,
      style: 'sectionTitle',
      color: accentColor,
      margin: [0, 0, 0, 4],
    },
    subtitle
      ? {
        text: subtitle,
        style: 'sectionSubtitle',
        margin: [0, 0, 0, 12],
      }
      : null,
  ].filter(Boolean)
}

function createMetricCard(title, value, accentColor, backgroundColor = PANEL_COLOR) {
  return {
    stack: [
      {
        text: title,
        style: 'metricLabel',
      },
      {
        text: value,
        style: 'metricValue',
        color: accentColor,
      },
    ],
    fillColor: backgroundColor,
    margin: [0, 0, 0, 0],
  }
}

function createMetricGrid(cards) {
  const rows = []

  for (let index = 0; index < cards.length; index += 3) {
    rows.push([
      cards[index] || '',
      cards[index + 1] || '',
      cards[index + 2] || '',
    ])
  }

  return {
    table: {
      widths: ['*', '*', '*'],
      body: rows,
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 2, 0, 6],
  }
}

function buildCurrentMonthSummary(expenses, incomeEntries, monthlyBudget, currentMonthStart, currentMonthEnd) {
  const currentMonthExpenses = expenses.filter((entry) => inRange(entry.spentOn || entry.createdAt, currentMonthStart, currentMonthEnd))
  const currentMonthIncome = incomeEntries.filter((entry) => inRange(entry.receivedOn || entry.createdAt, currentMonthStart, currentMonthEnd))

  const totalIncome = currentMonthIncome.reduce((sum, entry) => sum + normalizeTransactionAmount(entry), 0)
  const totalExpenses = currentMonthExpenses.reduce((sum, entry) => sum + normalizeTransactionAmount(entry), 0)
  const netBalance = totalIncome - totalExpenses
  const budgetRemaining = Math.max(monthlyBudget - totalExpenses, 0)
  const budgetUtilization = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    monthlyBudget,
    budgetRemaining,
    budgetUtilization,
    expenseTransactions: currentMonthExpenses,
    incomeTransactions: currentMonthIncome,
  }
}

function buildReportState({ user, expenses, incomeEntries, budget, selectedMonths }) {
  const safeSelectedMonths = clampMonths(selectedMonths)
  const currentDate = new Date()
  const reportEndDate = endOfDay(currentDate)
  const reportStartDate = startOfMonth(addMonths(currentDate, -(safeSelectedMonths - 1)))
  const currentMonthStart = startOfMonth(currentDate)
  const currentMonthEnd = endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))
  const monthlyBudget = Number(budget?.monthlyBudget ?? user?.monthlyBudget ?? 30000)

  const currentMonthSummary = buildCurrentMonthSummary(
    Array.isArray(expenses) ? expenses : [],
    Array.isArray(incomeEntries) ? incomeEntries : [],
    monthlyBudget,
    currentMonthStart,
    currentMonthEnd,
  )

  const reportTransactions = combineTransactions(expenses, incomeEntries, reportStartDate, reportEndDate)
  const reportExpenseTransactions = reportTransactions.filter((transaction) => transaction.type === 'Expense')
  const reportIncomeTransactions = reportTransactions.filter((transaction) => transaction.type === 'Income')

  const expenseCategoryMap = groupTransactionsByCategory(reportExpenseTransactions)
  const incomeCategoryMap = groupTransactionsByCategory(reportIncomeTransactions)
  const expenseCategoryRows = getSortedCategoryRows(expenseCategoryMap)
  const incomeCategoryRows = getSortedCategoryRows(incomeCategoryMap)

  const highestExpenseCategory = expenseCategoryRows[0] || null
  const highestIncomeCategory = incomeCategoryRows[0] || null

  return {
    user,
    expenses: Array.isArray(expenses) ? expenses : [],
    incomeEntries: Array.isArray(incomeEntries) ? incomeEntries : [],
    budget,
    selectedMonths: safeSelectedMonths,
    monthlyBudget,
    currentDate,
    reportStartDate,
    reportEndDate,
    reportPeriodLabel: formatReportPeriod(reportStartDate, reportEndDate),
    reportGeneratedLabel: formatDateTime(currentDate),
    currentMonthSummary,
    reportTransactions,
    reportExpenseTransactions,
    reportIncomeTransactions,
    expenseCategoryMap,
    incomeCategoryMap,
    expenseCategoryRows,
    incomeCategoryRows,
    highestExpenseCategory,
    highestIncomeCategory,
  }
}

export function generateExecutiveSummary(reportState) {

  const utilizationText = `${reportState.currentMonthSummary.budgetUtilization.toFixed(1)}%`
  const cards = [
    createMetricCard('Total Income', formatReportCurrency(reportState.currentMonthSummary.totalIncome), SUCCESS_COLOR),
    createMetricCard('Total Expenses', formatReportCurrency(reportState.currentMonthSummary.totalExpenses), DANGER_COLOR),
    createMetricCard('Net Balance', formatReportCurrency(reportState.currentMonthSummary.netBalance), reportState.currentMonthSummary.netBalance >= 0 ? SUCCESS_COLOR : DANGER_COLOR),
    createMetricCard('Monthly Budget', formatReportCurrency(reportState.currentMonthSummary.monthlyBudget), SECONDARY_COLOR),
    createMetricCard('Budget Remaining', formatReportCurrency(reportState.currentMonthSummary.budgetRemaining), reportState.currentMonthSummary.budgetRemaining > 0 ? SUCCESS_COLOR : WARNING_COLOR),
    createMetricCard('Budget Utilization', utilizationText, reportState.currentMonthSummary.budgetUtilization <= 70 ? SUCCESS_COLOR : reportState.currentMonthSummary.budgetUtilization <= 100 ? WARNING_COLOR : DANGER_COLOR),
  ]

  return [
    ...createSectionTitle('Executive Summary', 'Current month snapshot of income, spending, and budget health.'),
    createMetricGrid(cards),

    {
      stack: [
        {
          text: reportState.currentMonthSummary.budgetUtilization <= 70
            ? 'Budget utilization is in a healthy range.'
            : reportState.currentMonthSummary.budgetUtilization <= 100
              ? 'Budget utilization is moderate. Keep an eye on spend pace.'
              : 'Budget has been exceeded this month.',
          style: 'calloutText',
          color: reportState.currentMonthSummary.budgetUtilization <= 70 ? SUCCESS_COLOR : reportState.currentMonthSummary.budgetUtilization <= 100 ? WARNING_COLOR : DANGER_COLOR,
        },
      ],
      fillColor: '#f8fafc',
      margin: [0, 4, 0, 0],
      border: [true, true, true, true],
    },
  ]
}

export function generateIncomeAnalysis(reportState) {
  const rows = buildCategoryRows(reportState.incomeCategoryMap)

  return [
    {
      text: 'Income Analysis',
      style: 'sectionTitle',
      color: PRIMARY_COLOR,
      margin: [0, 16, 0, 4],
    },
    {
      text: 'Category-wise income sources for the selected report range.',
      style: 'sectionSubtitle',
      margin: [0, 0, 0, 12],
    },
    {
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Income source', style: 'tableHeader' },
            { text: 'Amount', style: 'tableHeaderRight' },
          ],
          ...rows,
        ],
      },
      layout: {
        fillColor: (rowIndex) => (rowIndex === 0 ? '#eef6ff' : rowIndex % 2 === 0 ? '#ffffff' : '#f8fbff'),
        hLineColor: () => PANEL_BORDER,
        vLineColor: () => PANEL_BORDER,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      },
      margin: [0, 0, 0, 10],
    },
    reportState.highestIncomeCategory
      ? {
        text: `Highest income source: ${reportState.highestIncomeCategory.category} (${formatReportCurrency(reportState.highestIncomeCategory.amount)})`,
        style: 'calloutText',
        color: SUCCESS_COLOR,
        margin: [0, 0, 0, 8],
      }
      : {
        text: 'No income entries found in the selected range.',
        style: 'calloutText',
        color: MUTED_COLOR,
        margin: [0, 0, 0, 8],
      },
  ]
}

export function generateExpenseAnalysis(reportState) {
  const rows = buildCategoryRows(reportState.expenseCategoryMap)

  return [
    {
      text: 'Expense Analysis',
      style: 'sectionTitle',
      color: PRIMARY_COLOR,
      margin: [0, 18, 0, 4],
    },
    {
      text: 'Category-wise spending for the selected report range.',
      style: 'sectionSubtitle',
      margin: [0, 0, 0, 12],
    },
    {
      table: {
        headerRows: 1,
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Expense category', style: 'tableHeader' },
            { text: 'Amount', style: 'tableHeaderRight' },
          ],
          ...rows,
        ],
      },
      layout: {
        fillColor: (rowIndex) => (rowIndex === 0 ? '#fff8f6' : rowIndex % 2 === 0 ? '#ffffff' : '#fffaf8'),
        hLineColor: () => PANEL_BORDER,
        vLineColor: () => PANEL_BORDER,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 8,
        paddingBottom: () => 8,
      },
      margin: [0, 0, 0, 10],
    },
    reportState.highestExpenseCategory
      ? {
        text: `Highest spending category: ${reportState.highestExpenseCategory.category} (${formatReportCurrency(reportState.highestExpenseCategory.amount)})`,
        style: 'calloutText',
        color: DANGER_COLOR,
        margin: [0, 0, 0, 8],
      }
      : {
        text: 'No expense entries found in the selected range.',
        style: 'calloutText',
        color: MUTED_COLOR,
        margin: [0, 0, 0, 8],
      },
  ]
}


export function generateTransactionTable(reportState) {
  const transactions = reportState.reportTransactions

  const bodyRows = transactions.length > 0
    ? transactions.map((transaction, index) => {
      const fillColor = index % 2 === 0 ? '#ffffff' : '#f8fbff'

      return [
        {
          text: formatLongDate(transaction.date),
          style: 'tableCell',
          fillColor,
        },
        {
          text: transaction.type,
          style: transaction.type === 'Income' ? 'tableCellPositive' : 'tableCellNegative',
          fillColor,
        },
        {
          text: transaction.category,
          style: 'tableCell',
          fillColor,
        },
        {
          text: transaction.title,
          style: 'tableCell',
          fillColor,
        },
        {
          text: transaction.transactionType,
          style: 'tableCell',
          fillColor,
        },
        {
          text: formatReportCurrency(transaction.amount),
          style: 'tableCellRight',
          fillColor,
        },
      ]
    })
    : [[
      {
        text: 'No transactions found in the selected range.',
        colSpan: 6,
        style: 'tableEmptyText',
        fillColor: '#ffffff',
      },
      {},
      {},
      {},
      {},
      {},
    ]]

  return [
    {
      text: 'Recent Transactions',
      style: 'sectionTitle',
      color: PRIMARY_COLOR,
      margin: [0, 0, 0, 4],
      pageBreak: 'before',
    },
    {
      text: 'All income and expense entries within the selected report range.',
      style: 'sectionSubtitle',
      margin: [0, 0, 0, 12],
    },
    {
      table: {
        headerRows: 1,
        widths: [68, 54, 72, '*', 72, 72],
        body: [
          [
            { text: 'Date', style: 'tableHeader' },
            { text: 'Type', style: 'tableHeader' },
            { text: 'Category', style: 'tableHeader' },
            { text: 'Title', style: 'tableHeader' },
            { text: 'Transaction Type', style: 'tableHeader' },
            { text: 'Amount', style: 'tableHeaderRight' },
          ],
          ...bodyRows,
        ],
      },
      layout: {
        hLineColor: () => PANEL_BORDER,
        vLineColor: () => PANEL_BORDER,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 7,
        paddingBottom: () => 7,
      },
    },
  ]
}

export function generateExpenseReport({
  user,
  expenses = [],
  incomeEntries = [],
  budget = {},
  selectedMonths = 6,
} = {}) {
  const reportState = buildReportState({
    user,
    expenses,
    incomeEntries,
    budget,
    selectedMonths,
  })

  const generatedOnText = reportState.reportGeneratedLabel
  const periodText = reportState.reportPeriodLabel
  const reportUserName = user?.name || 'ExpenseFlow User'
  const reportUserEmail = user?.email || 'N/A'
  const fileName = `ExpenseFlow_Financial_Report_${reportState.reportStartDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).replace(/\s+/g, '_')}_to_${reportState.currentDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }).replace(/\s+/g, '_')}.pdf`

  const documentDefinition = {
    pageSize: 'A4',
    pageMargins: [36, 34, 36, 72],
    defaultStyle: {
      fontSize: 10,
      color: TEXT_COLOR,
    },
    styles: {
      reportBrand: {
        fontSize: 22,
        bold: true,
        color: PRIMARY_COLOR,
      },
      reportTitle: {
        fontSize: 18,
        bold: true,
        color: TEXT_COLOR,
      },
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: TEXT_COLOR,
      },
      sectionSubtitle: {
        fontSize: 9.5,
        color: MUTED_COLOR,
      },
      metricLabel: {
        fontSize: 9,
        color: MUTED_COLOR,
        bold: true,
      },
      metricValue: {
        fontSize: 15,
        bold: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 9.2,
        color: TEXT_COLOR,
      },
      tableHeaderRight: {
        bold: true,
        fontSize: 9.2,
        color: TEXT_COLOR,
        alignment: 'right',
      },
      tableCell: {
        fontSize: 9,
        color: TEXT_COLOR,
      },
      tableCellRight: {
        fontSize: 9,
        color: TEXT_COLOR,
        alignment: 'right',
      },
      tableCellPositive: {
        fontSize: 9,
        color: SUCCESS_COLOR,
        bold: true,
      },
      tableCellNegative: {
        fontSize: 9,
        color: DANGER_COLOR,
        bold: true,
      },
      tableTotalLabel: {
        fontSize: 9,
        color: TEXT_COLOR,
        bold: true,
      },
      tableTotalValue: {
        fontSize: 9,
        color: TEXT_COLOR,
        bold: true,
        alignment: 'right',
      },
      tableEmptyText: {
        fontSize: 9.5,
        color: MUTED_COLOR,
        italics: true,
        alignment: 'center',
      },
      calloutText: {
        fontSize: 9.5,
        bold: true,
      },
    },
    content: [
      {
        stack: [
          {
            text: 'ExpenseFlow',
            style: 'reportBrand',
            alignment: 'center',
            margin: [0, 0, 0, 4],
          },
          {
            text: 'Financial Summary Report',
            style: 'reportTitle',
            alignment: 'center',
            margin: [0, 0, 0, 12],
          },

          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      { text: 'User Name:', bold: true, fontSize: 9.5, color: MUTED_COLOR },
                      { text: reportUserName, fontSize: 10.5, bold: true, color: TEXT_COLOR, margin: [0, 2, 0, 0] },
                    ],
                    border: [false, false, false, false],
                    fillColor: PANEL_COLOR,
                    margin: [6, 4, 6, 4],
                  },
                  {
                    stack: [
                      { text: 'Email ID:', bold: true, fontSize: 9.5, color: MUTED_COLOR },
                      { text: reportUserEmail, fontSize: 10.5, bold: true, color: TEXT_COLOR, margin: [0, 2, 0, 0] },
                    ],
                    border: [false, false, false, false],
                    fillColor: PANEL_COLOR,
                    margin: [6, 4, 6, 4],
                  },
                ],
                [
                  {
                    stack: [
                      { text: 'Period:', bold: true, fontSize: 9.5, color: MUTED_COLOR },
                      { text: periodText, fontSize: 10.5, bold: true, color: TEXT_COLOR, margin: [0, 2, 0, 0] },
                    ],
                    border: [false, false, false, false],
                    fillColor: PANEL_COLOR,
                    margin: [6, 4, 6, 4],
                  },
                  {
                    stack: [
                      { text: 'Generated:', bold: true, fontSize: 9.5, color: MUTED_COLOR },
                      { text: generatedOnText, fontSize: 10.5, bold: true, color: TEXT_COLOR, margin: [0, 2, 0, 0] },
                    ],
                    border: [false, false, false, false],
                    fillColor: PANEL_COLOR,
                    margin: [6, 4, 6, 4],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
            margin: [0, 0, 0, 12],
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 523,
                y2: 0,
                lineWidth: 2.2,
                lineColor: PRIMARY_COLOR,
              },
            ],
            margin: [0, 0, 0, 16],
          },
          ...generateExecutiveSummary(reportState),
          ...generateIncomeAnalysis(reportState),
          ...generateExpenseAnalysis(reportState),
        ],
      },
      ...generateTransactionTable(reportState),
    ],
    footer: (currentPage, pageCount) => ({
      margin: [36, 0, 36, 24],
      stack: [
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 523,
              y2: 0,
              lineWidth: 2,
              lineColor: PANEL_BORDER,
            },
          ],
          margin: [0, 0, 0, 8],
        },
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: 'Generated by ExpenseFlow',
                  fontSize: 9,
                  bold: true,
                  color: PRIMARY_COLOR,
                },
                {
                  text: 'Personal Expense Tracking System',
                  fontSize: 8.5,
                  color: MUTED_COLOR,
                },
                {
                  text: `Report Generated On: ${generatedOnText}`,
                  fontSize: 8.5,
                  color: MUTED_COLOR,
                },
                {
                  text: 'Contact Us  |  +91(IN) 12345 67890  |  support@expenseflow.com',
                  fontSize: 8.5,
                  color: MUTED_COLOR,
                  margin: [0, 2, 0, 0],
                },
              ],
            },
            {
              width: 'auto',
              alignment: 'right',
              stack: [
                {
                  text: `Page ${currentPage} of ${pageCount}`,
                  fontSize: 9,
                  bold: true,
                  color: TEXT_COLOR,
                },
              ],
            },
          ],
        },
      ],
    }),
  }

  pdfMake.createPdf(documentDefinition).download(fileName)

  return documentDefinition
}
