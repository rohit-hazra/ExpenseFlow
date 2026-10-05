function InputField({ label, name, type, placeholder, value, onChange, icon, ...inputProps }) {
  const Icon = icon

  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold text-[var(--text-primary)] sm:text-sm">{label}</span>
      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        ) : null}
        <input
          required
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...inputProps}
          className={`w-full rounded-[1.2rem] border border-white/20 bg-white/70 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-transparent focus:ring-4 focus:ring-sky-400/20 dark:bg-white/8 sm:py-3.5 ${
            Icon ? 'pl-11 pr-4' : 'px-4'
          }`}
        />
      </div>
    </label>
  )
}

export default InputField
