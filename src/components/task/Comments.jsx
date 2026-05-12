import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Send, Trash2 } from 'lucide-react'
import { taskService } from '../../services/taskService'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../ui/Avatar'
import { formatRelative } from '../../utils/dateUtils'

export default function Comments({ taskId, comments = [], onCommentAdded, onCommentDeleted }) {
  const { t } = useTranslation()
  const { user, profile } = useAuthStore()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      const comment = await taskService.addComment(taskId, user.id, content.trim())
      setContent('')
      onCommentAdded?.(comment)
    } catch (err) {
      toast.error(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await taskService.deleteComment(commentId)
      onCommentDeleted?.(commentId)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <div>
      <div className="space-y-4 mb-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar user={comment.user} size="sm" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {comment.user?.full_name || comment.user?.email}
                </span>
                <span className="text-xs text-gray-400">{formatRelative(comment.created_at)}</span>
              </div>
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200">
                {comment.content}
                {comment.user_id === user?.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Hələ şərh yoxdur</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar user={profile || user} size="sm" />
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) } }}
            placeholder={t('task.addComment')}
            rows={1}
            className="input resize-none pr-10"
          />
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary-600 disabled:text-gray-300 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
