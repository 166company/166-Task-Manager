import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Bell, Sun, Moon, Globe, Plus } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useProjectStore } from '../../store/projectStore'
import { useTaskStore } from '../../store/taskStore'
import { useTheme } from '../../hooks/useTheme'
import Avatar from '../ui/Avatar'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { openCreateTaskModal } = useUIStore()
  const { currentProject } = useProjectStore()
  const { setFilters } = useTaskStore()
  const { profile, user } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = useCallback((val) => {
    setSearchVal(val)
    setFilters({ search: val })
  }, [setFilters])

  const toggleLang = () => {
    const next = i18n.language === 'az' ? 'en' : 'az'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 gap-4">
      {/* Left: project title */}
      <div className="flex items-center gap-3 min-w-0">
        {currentProject && (
          <>
            <span className="text-xl">{currentProject.icon}</span>
            <h1 className="font-semibold text-gray-900 dark:text-white truncate">{currentProject.name}</h1>
          </>
        )}
      </div>

      {/* Center: search */}
      <div className="flex-1 max-w-md">
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              autoFocus
              value={searchVal}
              onChange={e => handleSearch(e.target.value)}
              onBlur={() => { if (!searchVal) setSearchOpen(false) }}
              placeholder={t('common.search')}
              className="input pl-9 py-1.5"
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{t('common.search')}</span>
            <kbd className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {currentProject && (
          <button
            onClick={() => openCreateTaskModal()}
            className="btn-primary text-xs px-3 py-1.5 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('task.create')}
          </button>
        )}

        <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 text-xs font-medium">
          {i18n.language.toUpperCase()}
        </button>

        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 relative">
          <Bell className="w-4 h-4" />
        </button>

        <Avatar user={profile || user} size="sm" />
      </div>
    </header>
  )
}
