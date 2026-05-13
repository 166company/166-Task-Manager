import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { PROJECT_COLORS, PROJECT_ICONS } from '../../utils/constants'

export default function CreateWorkspaceModal({ onClose }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { createWorkspace } = useProjectStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4F46E5')
  const [icon, setIcon] = useState('🏢')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createWorkspace(name.trim(), description.trim(), user.id, color, icon)
      toast.success(t('success.created'))
      onClose()
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={t('workspace.create')} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label={t('workspace.name')}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Komanda adı..."
          autoFocus
          required
        />

        {/* Icon seçimi */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">İkon</label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto scrollbar-thin">
            {PROJECT_ICONS.map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  icon === ic
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Rəng seçimi */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Rəng</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <p className="font-medium text-gray-900 dark:text-white">{name || 'Workspace adı'}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('workspace.description')}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Qısa açıqlama..."
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
