import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Camera } from 'lucide-react'
import { supabase } from '../services/supabase'
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
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName })
      toast.success(t('success.saved'))
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `avatars/${user.id}/${Date.now()}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: publicUrl })
      toast.success('Avatar yeniləndi')
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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
                  <Avatar user={profile || user} size="lg" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md hover:bg-primary-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{profile?.full_name || 'İstifadəçi'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

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
          </div>
        </main>
      </div>
    </div>
  )
}
