import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Link2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import Avatar from '../components/ui/Avatar'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Profile() {
  const { t } = useTranslation()
  const { user, profile, updateProfile } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [avatarMode, setAvatarMode] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName, avatar_url: avatarUrl || null })
      toast.success(t('success.saved'))
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const previewUser = { ...profile, full_name: fullName, avatar_url: avatarUrl || profile?.avatar_url }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('nav.profile')}</h2>

          <div className="max-w-md">
            <div className="card p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar user={previewUser} size="lg" />
                  <button
                    onClick={() => setAvatarMode(v => !v)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors text-xs"
                    title="Avatar URL daxil et"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{profile?.full_name || 'İstifadəçi'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Avatar URL input */}
              {avatarMode && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-2">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Google Drive, Imgur, GitHub və ya hər hansı şəkil URL-i yapışdırın
                  </p>
                  <input
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="input text-sm"
                  />
                  <p className="text-xs text-gray-400">
                    Google Drive: Faylı "Hər kəs" ilə paylaşın → "Linki kopyala" → burada istifadə edin
                  </p>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  label={t('auth.fullName')}
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                <Input
                  label={t('auth.email')}
                  value={user?.email || ''}
                  disabled
                />
                <Button type="submit" loading={saving}>{t('common.save')}</Button>
              </form>
            </div>

            {/* Storage tips */}
            <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">💡 Pulsuz limiti qorumaq üçün</p>
              <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                <li>✓ Faylları Google Drive / Mega-da saxlayın, link əlavə edin</li>
                <li>✓ Şəkilləri Imgur.com-a yükləyin, link istifadə edin</li>
                <li>✓ Supabase-ə həftədə 1 dəfə girin (pause olmasın)</li>
                <li>✓ DB limit: 500MB — task məlumatları üçün çox artıqdır</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
