import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'zh-CN', label: '中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日' },
] as const

export default function LanguageSwitch() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 p-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
            i18n.language === lang.code
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
          aria-label={lang.label}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
