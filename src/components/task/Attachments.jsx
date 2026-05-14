import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Upload, FileText, Image, Trash2, Download, Link, ExternalLink, Play } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatFileSize } from '../../utils/formatters'
import { formatDate } from '../../utils/dateUtils'

// Extract preview info from URL
function getUrlPreview(url) {
  if (!url) return null
  try {
    const u = new URL(url)

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (ytMatch) return { type: 'youtube', thumb: `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`, id: ytMatch[1] }

    // Google Drive image/video
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
    if (driveMatch) return { type: 'drive', thumb: `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w400`, directUrl: `https://drive.google.com/uc?export=view&id=${driveMatch[1]}` }

    // Google Drive direct share (uc?id=...)
    const driveUc = url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/)
    if (driveUc) return { type: 'drive', thumb: `https://drive.google.com/thumbnail?id=${driveUc[1]}&sz=w400` }

    // Mega
    if (u.hostname.includes('mega.nz') || u.hostname.includes('mega.co.nz')) {
      return { type: 'mega', icon: '🔒' }
    }

    // Dropbox - convert to direct
    if (u.hostname.includes('dropbox.com')) {
      const direct = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '')
      const ext = url.split('.').pop()?.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return { type: 'image', thumb: direct }
      return { type: 'dropbox' }
    }

    // Direct image
    const ext = u.pathname.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return { type: 'image', thumb: url }
    if (['mp4', 'webm', 'mov'].includes(ext)) return { type: 'video' }

    return { type: 'link' }
  } catch {
    return { type: 'link' }
  }
}

function AttachmentPreview({ url, name }) {
  const preview = getUrlPreview(url)
  const [imgError, setImgError] = useState(false)

  if (!preview) return null

  if ((preview.type === 'image' || preview.type === 'drive') && !imgError) {
    return (
      <img
        src={preview.thumb || url}
        alt={name}
        onError={() => setImgError(true)}
        className="w-full h-32 object-cover rounded-lg bg-gray-100 dark:bg-gray-700"
      />
    )
  }

  if (preview.type === 'youtube') {
    return (
      <div className="relative">
        <img src={preview.thumb} alt={name} className="w-full h-32 object-cover rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    )
  }

  if (preview.type === 'video') {
    return (
      <video src={url} className="w-full h-32 object-cover rounded-lg bg-black" controls preload="metadata" />
    )
  }

  if (preview.type === 'mega') {
    return (
      <div className="w-full h-20 rounded-lg bg-gray-800 flex items-center justify-center gap-2">
        <span className="text-2xl">🔒</span>
        <div>
          <p className="text-white text-xs font-medium">Mega</p>
          <p className="text-gray-400 text-xs">Şifrəli fayl</p>
        </div>
      </div>
    )
  }

  return null
}

export default function Attachments({ taskId, attachments = [], onAttachmentAdded, onAttachmentDeleted }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [linkMode, setLinkMode] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkName, setLinkName] = useState('')

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
        task_id: taskId, file_url: publicUrl, file_name: file.name,
        file_size: file.size, uploaded_by: user.id,
      }).select().single()
      if (error) throw error
      onAttachmentAdded?.(data)
      toast.success('Fayl yükləndi')
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleAddLink = async () => {
    if (!linkUrl.trim()) return
    let name = linkName.trim()
    if (!name) {
      try { name = new URL(linkUrl).hostname } catch { name = linkUrl.slice(0, 40) }
    }
    try {
      const { data, error } = await supabase.from('attachments').insert({
        task_id: taskId, file_url: linkUrl.trim(), file_name: name,
        file_size: null, uploaded_by: user.id,
      }).select().single()
      if (error) throw error
      onAttachmentAdded?.(data)
      setLinkUrl('')
      setLinkName('')
      setLinkMode(false)
      toast.success('Link əlavə edildi')
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    }
  }

  const handleDelete = async (att) => {
    try {
      await supabase.from('attachments').delete().eq('id', att.id)
      if (att.file_size !== null && att.file_url.includes('supabase')) {
        const path = att.file_url.split('/attachments/')[1]
        if (path) await supabase.storage.from('attachments').remove([path])
      }
      onAttachmentDeleted?.(att.id)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const isImage = (name) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name || '')
  const isLink = (att) => att.file_size === null

  return (
    <div>
      {/* Attachments grid */}
      <div className="space-y-2 mb-4">
        {attachments.map(att => {
          const isExtLink = isLink(att)
          const preview = isExtLink ? getUrlPreview(att.file_url) : null
          const hasThumb = preview && ['image', 'youtube', 'drive', 'video'].includes(preview.type)

          return (
            <div key={att.id} className="group rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
              {/* Preview */}
              {hasThumb && (
                <AttachmentPreview url={att.file_url} name={att.file_name} />
              )}
              {!hasThumb && isExtLink && preview?.type === 'mega' && (
                <AttachmentPreview url={att.file_url} name={att.file_name} />
              )}
              {/* File info row */}
              <div className="flex items-center gap-3 p-2.5">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  {isExtLink
                    ? <Link className="w-4 h-4 text-indigo-500" />
                    : isImage(att.file_name)
                      ? <Image className="w-4 h-4 text-blue-500" />
                      : <FileText className="w-4 h-4 text-gray-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{att.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {att.file_size ? formatFileSize(att.file_size) : 'Xarici link'} · {formatDate(att.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={att.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDelete(att)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {attachments.length === 0 && !linkMode && (
          <p className="text-sm text-gray-400 text-center py-3">Fayl və ya link əlavə edilməyib</p>
        )}
      </div>

      {/* Link input */}
      {linkMode && (
        <div className="mb-3 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 space-y-2">
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAddLink(); if (e.key === 'Escape') setLinkMode(false) }}
            placeholder="https://drive.google.com/... və ya https://mega.nz/..."
            className="input text-sm"
          />
          <input
            value={linkName}
            onChange={e => setLinkName(e.target.value)}
            placeholder="Ad (istəyə görə)"
            className="input text-sm"
          />
          {linkUrl && getUrlPreview(linkUrl) && (
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 max-w-xs">
              <AttachmentPreview url={linkUrl} name={linkName || 'Preview'} />
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleAddLink} disabled={!linkUrl.trim()}
              className="btn-primary text-xs px-3 py-1.5">Əlavə et</button>
            <button onClick={() => { setLinkMode(false); setLinkUrl(''); setLinkName('') }}
              className="btn-secondary text-xs px-3 py-1.5">İmtina</button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!linkMode && (
        <div className="flex items-center gap-3">
          <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {uploading ? 'Yüklənir...' : 'Fayl yüklə'}
          </button>
          <span className="text-gray-200 dark:text-gray-600">|</span>
          <button onClick={() => setLinkMode(true)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors">
            <Link className="w-4 h-4" />
            Link əlavə et
          </button>
        </div>
      )}
    </div>
  )
}
