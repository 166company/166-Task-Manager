import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useProjectStore } from '../../store/projectStore'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import IconPicker, { ICONS } from '../ui/IconPicker'
import ColorPicker from '../ui/ColorPicker'

export default function EditWorkspaceModal({ workspace, onClose }) {
  const { t } = useTranslation()
  const { updateWorkspace, deleteWorkspace } = useProjectStore()
  const [name, setName] = useState(workspace.name || '')
  const [description, setDescription] = useState(workspace.description || '')
  const [color, setColor] = useState(workspace.color || '#4F46E5')
  const [icon, setIcon] = useState(workspace.icon || 'briefcase')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedIcon = ICONS.find(i => i.iconName === icon) || ICONS[0]

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await updateWorkspace(workspace.id, { name: name.trim(), description, color, icon })
      toast.success(t('success.saved'))
      onClose()
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteWorkspace(workspace.id)
      toast.success(t('success.deleted'))
      onClose()
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Workspace redaktə et" size="md">
      <form onSubmit={handleSave} className="p-6 space-y-5">
        <Input
          label="Workspace adı"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">İkon</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Rəng</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color }}>
            <FontAwesomeIcon icon={selectedIcon} className="text-white" style={{ width: 20, height: 20 }} />
          </div>
          <p className="font-medium text-gray-900 dark:text-white">{name || 'Workspace adı'}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Təsvir</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="input resize-none"
            placeholder="Qısa açıqlama..."
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">Əminsiniz?</span>
              <Button type="button" variant="danger" size="sm" onClick={handleDelete} loading={loading}>Bəli, sil</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Xeyr</Button>
            </div>
          ) : (
            <Button type="button" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4" />
              Sil
            </Button>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" loading={loading}>{t('common.save')}</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
