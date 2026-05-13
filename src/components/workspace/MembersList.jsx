import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { UserPlus, Search, X } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../services/projectService'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

export default function MembersList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { members, currentWorkspace, fetchMembers } = useProjectStore()
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    projectService.getAllProfiles().then(setAllUsers).catch(() => {})
  }, [])

  const memberUserIds = members.map(m => m.user_id)

  const filteredUsers = allUsers.filter(u =>
    !memberUserIds.includes(u.id) &&
    u.id !== user?.id &&
    (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAdd = async () => {
    if (!selectedUser || !currentWorkspace) return
    setLoading(true)
    try {
      await projectService.inviteMember(currentWorkspace.id, selectedUser.id, role)
      await fetchMembers(currentWorkspace.id)
      toast.success(t('success.invited'))
      setSelectedUser(null)
      setSearch('')
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* User search & select */}
      <div className="flex gap-2 mb-4 items-end">
        <div className="flex-1 relative">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">İstifadəçi seç</label>
          {selectedUser ? (
            <div className="input flex items-center gap-2">
              <Avatar user={selectedUser} size="xs" />
              <span className="flex-1 text-sm">{selectedUser.full_name || selectedUser.email}</span>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Ad və ya email axtar..."
                className="input pl-9"
              />
              {showDropdown && search && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedUser(u); setSearch(''); setShowDropdown(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Avatar user={u} size="xs" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.full_name || 'İsimsiz'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && search && filteredUsers.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3 text-sm text-gray-400 text-center">
                  İstifadəçi tapılmadı
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="input">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <Button onClick={handleAdd} disabled={!selectedUser} loading={loading} className="mb-0.5">
          <UserPlus className="w-4 h-4" />
          Əlavə et
        </Button>
      </div>

      {/* Members list */}
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
        {members.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Hələ üzv yoxdur</p>
        )}
      </div>
    </div>
  )
}
