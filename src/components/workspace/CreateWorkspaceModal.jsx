import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import IconPicker, { ICONS } from '../ui/IconPicker'
import ColorPicker from '../ui/ColorPicker'

export default function CreateWorkspaceModal({ onClose }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { createWorkspace } = useProjectStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4F46E5')
  const [icon, setIcon] = useState('briefcase')
  const [iconColor, setIconColor] = useState('#FFFFFF')
  const [loading, setLoading] = useState(false)

  const selectedIcon = ICONS.find(i => i.iconName === icon) || ICONS[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createWorkspace(name.trim(), description.trim(), user.id, color, icon, iconColor)
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
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <Input
          label={t('workspace.name')}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Komanda adı..."
          autoFocus
          required
        />

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">İkon</label>
          <IconPicker value={icon} onChange={setIcon} iconColor={iconColor} onIconColorChange={setIconColor} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Rəng</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color }}>
            <FontAwesomeIcon icon={selectedIcon} style={{ color: iconColor, width: 20, height: 20 }} />
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
