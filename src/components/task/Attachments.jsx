import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Upload, FileText, Image, Trash2, Download } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatFileSize } from '../../utils/formatters'
import { formatDate } from '../../utils/dateUtils'

export default function Attachments({ taskId, attachments = [], onAttachmentAdded, onAttachmentDeleted }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const path = `tasks/${taskId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('attachments').upload(path, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(path)

      const { data, error } = await supabase.from('attachments').insert({
        task_id: taskId,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user.id,
      }).select().single()

      if (error) throw error
      onAttachmentAdded?.(data)
      toast.success('Fayl yükləndi')
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (attachment) => {
    try {
      await supabase.from('attachments').delete().eq('id', attachment.id)
      onAttachmentDeleted?.(attachment.id)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const isImage = (name) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name || '')

  return (
    <div>
      <div className="space-y-2 mb-3">
        {attachments.map(att => (
          <div key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-primary-300 transition-colors">
            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
              {isImage(att.file_name)
                ? <Image className="w-4 h-4 text-blue-500" />
                : <FileText className="w-4 h-4 text-gray-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{att.file_name}</p>
              <p className="text-xs text-gray-400">{formatFileSize(att.file_size)} · {formatDate(att.created_at)}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleDelete(att)}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {attachments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-3">Fayl əlavə edilməyib</p>
        )}
      </div>

      <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Yüklənir...' : 'Fayl əlavə et'}
      </button>
    </div>
  )
}
