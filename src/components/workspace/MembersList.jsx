import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function MembersList() {
  const { t } = useTranslation()
  const { members, currentWorkspace, inviteMember } = useProjectStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!email.trim() || !currentWorkspace) return
    setLoading(true)
    try {
      await inviteMember(currentWorkspace.id, email.trim(), 'member')
      toast.success(t('success.invited'))
      setEmail('')
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleInvite} className="flex gap-2 mb-4">
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          type="email"
        />
        <Button type="submit" loading={loading} className="shrink-0">
          <UserPlus className="w-4 h-4" />
          {t('workspace.invite')}
        </Button>
      </form>

      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Avatar user={member.profile} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {member.profile?.full_name || member.profile?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{member.profile?.email}</p>
            </div>
            <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
