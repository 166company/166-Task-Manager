import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { PROJECT_COLORS, PROJECT_ICONS } from '../../utils/constants'

export default function CreateProjectModal({ onClose }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { currentWorkspace, createProject } = useProjectStore()
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], icon: PROJECT_ICONS[0] })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !currentWorkspace) return
    setLoading(true)
    try {
      await createProject(currentWorkspace.id, form, user.id)
      toast.success(t('success.created'))
      onClose()
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={t('project.create')}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label={t('project.name')}
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Yeni layihə"
          autoFocus
          required
        />

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('project.icon')}</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm(f => ({ ...f, icon }))}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === icon ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('project.color')}</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setForm(f => ({ ...f, color }))}
                className={`w-7 h-7 rounded-full transition-all ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Təsvir</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Layihə haqqında qısa məlumat..."
            rows={2}
            className="input resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading}>{t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  )
}
