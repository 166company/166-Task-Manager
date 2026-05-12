import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function RegisterForm() {
  const { t } = useTranslation()
  const { signUp } = useAuthStore()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error(t('errors.passwordShort'))
      return
    }
    setLoading(true)
    try {
      await signUp(form.email, form.password, form.fullName)
      setDone(true)
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✉️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email-inizi yoxlayın</h2>
        <p className="text-gray-500 text-sm">
          <strong>{form.email}</strong> ünvanına təsdiq linki göndərdik. Linki kliklədikdən sonra daxil ola bilərsiniz.
        </p>
        <Link to="/login" className="mt-6 inline-block text-primary-600 hover:underline text-sm">
          Daxil olmağa qayıt
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-lg">166</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('auth.register')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.fullName')}
          type="text"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          placeholder="Ad Soyad"
          required
        />
        <Input
          label={t('auth.email')}
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="siz@email.com"
          required
        />
        <Input
          label={t('auth.password')}
          type="password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="Minimum 6 simvol"
          required
        />
        <Button type="submit" className="w-full justify-center" loading={loading}>
          {t('auth.register')}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-primary-600 hover:underline font-medium">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  )
}
