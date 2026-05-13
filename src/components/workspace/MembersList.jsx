import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { UserPlus, Search, X, Trash2, ChevronDown } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../services/projectService'
import { supabase } from '../../services/supabase'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Hər şeyi edə bilər' },
  { value: 'member', label: 'Member', desc: 'Tapşırıq yarada bilər' },
  { value: 'viewer', label: 'Viewer', desc: 'Yalnız baxa bilər' },
]

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
  const myMember = members.find(m => m.user_id === user?.id)
  const isAdmin = myMember?.role === 'admin'

  const filteredUsers = allUsers.filter(u =>
    !memberUserIds.includes(u.id) &&
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

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await supabase.from('workspace_members').update({ role: newRole }).eq('id', memberId)
      await fetchMembers(currentWorkspace.id)
      toast.success(t('success.saved'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const handleRemove = async (member) => {
    if (!confirm(`"${member.profile?.full_name || member.profile?.email}" üzvü silmək istədiyinizə əminsiniz?`)) return
    try {
      await supabase.from('workspace_members').delete().eq('id', member.id)
      await fetchMembers(currentWorkspace.id)
      toast.success(t('success.deleted'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <div>
      {/* Add member */}
      {isAdmin && (
        <div className="flex gap-2 mb-5 items-end">
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
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder="Ad və ya email axtar..."
                  className="input pl-9"
                />
                {showDropdown && search && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                      <button key={u.id} onMouseDown={() => { setSelectedUser(u); setSearch(''); setShowDropdown(false) }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Avatar user={u} size="xs" />
                        <div className="text-left">
                          <p className="text-sm font-medium">{u.full_name || 'İsimsiz'}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </button>
                    )) : (
                      <p className="text-sm text-gray-400 text-center p-3">İstifadəçi tapılmadı</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <Button onClick={handleAdd} disabled={!selectedUser} loading={loading} className="mb-0.5">
            <UserPlus className="w-4 h-4" />
            Əlavə et
          </Button>
        </div>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {members.map(member => {
          const isOwner = currentWorkspace?.owner_id === member.user_id
          const isMe = member.user_id === user?.id
          const canEdit = isAdmin && !isOwner && !isMe

          return (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-800 transition-colors">
              <Avatar user={member.profile} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.profile?.full_name || member.profile?.email}
                  </p>
                  {isOwner && <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">Sahib</span>}
                  {isMe && <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full">Sən</span>}
                </div>
                <p className="text-xs text-gray-400 truncate">{member.profile?.email}</p>
              </div>

              {/* Role selector */}
              {canEdit ? (
                <div className="relative">
                  <select
                    value={member.role}
                    onChange={e => handleRoleChange(member.id, e.target.value)}
                    className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              ) : (
                <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${
                  member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                  member.role === 'viewer' ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {ROLES.find(r => r.value === member.role)?.label || member.role}
                </span>
              )}

              {/* Delete */}
              {canEdit && (
                <button onClick={() => handleRemove(member)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
