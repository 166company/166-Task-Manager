import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function CreateWorkspaceModal({ onClose }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { createWorkspace } = useProjectStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createWorkspace(name.trim(), description.trim(), user.id)
      toast.success(t('success.created'))
      onClose()
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={t('workspace.create')}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label={t('workspace.name')}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Komanda workspace-i"
          autoFocus
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('workspace.description')}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Qısa açıqlama..."
            rows={3}
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
