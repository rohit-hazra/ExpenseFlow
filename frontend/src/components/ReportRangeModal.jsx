const reportRangeOptions = [1, 2, 3, 4, 5, 6]

function getRangeLabel(months) {
  return months === 1 ? 'Last 1 Month' : `Last ${months} Months`
}

function ReportRangeModal({
  isOpen,
  selectedMonths,
  onSelectMonths,
  onCancel,
  onDownload,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close report dialog"
        onClick={onCancel}
        className="absolute inset-0 z-0 bg-slate-950/55 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-range-title"
        className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/20 bg-white/92 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl dark:bg-slate-950/95 dark:border-white/10 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              PDF report
            </p>
            <h2 id="report-range-title" className="mt-2 font-display text-2xl font-semibold text-[var(--text-primary)]">
              Select report range
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Choose how many months of financial data should be included in the PDF report.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[var(--text-secondary)] transition hover:bg-white dark:bg-white/10"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(14,165,233,0.08))] p-4 sm:p-5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Current selection: <span className="text-orange-500">{getRangeLabel(selectedMonths)}</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
            The report includes current month summary and full transaction history.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {reportRangeOptions.map((months) => {
            const isSelected = months === selectedMonths

            return (
              <button
                key={months}
                type="button"
                onClick={() => onSelectMonths(months)}
                className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${
                  isSelected
                    ? 'border-orange-300 bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'border-white/20 bg-white/70 text-[var(--text-primary)] hover:-translate-y-0.5 dark:bg-white/8'
                }`}
              >
                {/* <span className="block text-xs font-semibold uppercase tracking-[0.24em] opacity-80">
                  Report range
                </span> */}
                <span className="mt-2 block text-lg font-semibold">
                  {getRangeLabel(months)}
                </span>
                <span className={`mt-1 block text-xs ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                  {months} month{months > 1 ? 's' : ''} of data
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/25 bg-white/70 px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white dark:bg-white/8"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="rounded-full bg-[linear-gradient(135deg,#f97316,#0ea5e9)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
          >
            Download
          </button>
        </div>
      </section>
    </div>
  )
}

export default ReportRangeModal
