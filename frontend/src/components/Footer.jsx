import { GithubIcon, LinkedinIcon, MailIcon, TwitterIcon, WalletIcon } from './Icons'

const contactLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/rohit-hazra',
    icon: GithubIcon,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rohit-hazra-3b9615317',
    icon: LinkedinIcon,
  },
  {
    name: 'Twitter',
    href: 'https://x.com/_Rohit_Hazra_',
    icon: TwitterIcon,
  },
  {
    name: 'Mail',
    href: 'mailto:l.rohit.hazra@gmail.com',
    icon: MailIcon,
  },
]

function Footer({ onPrimaryAction, onSecondaryAction }) {
  return (
    <footer
      id="footer"
      className="mt-10 overflow-hidden rounded-[2.5rem_2.5rem_0_0] border border-white/10 bg-[linear-gradient(135deg,#020617,#0f172a,#1e3a8a)] text-white shadow-2xl shadow-slate-950/20"
    >
      <div className="px-5 py-9 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">

          {/* Left Section */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ec4899,#06b6d4)] shadow-lg shadow-pink-500/20">
                {/* <i className="fa-solid fa-wallet text-lg text-white" /> */}
                <WalletIcon className="text-xl sm:text-2xl" />
              </div>

              <div>
                <h2 className="font-display text-xl font-bold sm:text-2xl">
                  ExpenseFlow
                </h2>

                <p className="text-xs text-slate-400 sm:text-sm">
                  Smart expense management platform
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-xs leading-6 text-slate-300 sm:text-sm sm:leading-7">
              Take control of your daily finances with a clean and intuitive platform designed to help you manage spending, track income, and stay organized effortlessly.
            </p>
          </div>

          {/* Middle Section */}
          <div>
            <h3 className="font-display text-base font-semibold text-white sm:text-lg">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-4">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="flex items-center gap-2 text-left text-xs font-medium text-slate-300 transition hover:text-white sm:text-sm"
              >
                <i className="fa-solid fa-angle-right text-xs" />
                Get Started
              </button>

              <button
                type="button"
                onClick={onSecondaryAction}
                className="flex items-center gap-2 text-left text-xs font-medium text-slate-300 transition hover:text-white sm:text-sm"
              >
                <i className="fa-solid fa-angle-right text-xs" />
                Sign In
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <h3 className="font-display text-base font-semibold text-white sm:text-lg">
              Connect
            </h3>

            <div className="mt-5 flex items-center gap-4">
              {contactLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={name}
                  className="group flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <Icon className="h-5 w-5 text-slate-300 transition group-hover:text-white" />
                </a>
              ))}
            </div>

            <p className="mt-6 text-xs leading-6 text-slate-400 sm:text-sm sm:leading-7">
              Smart financial tracking experience built for simplicity, clarity, and better money management.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
          <p>© 2026 ExpenseFlow. All rights reserved.</p>

          <p>
            Designed & Developed by{' '}
            <span className="font-semibold text-white">
              Rohit Hazra
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
