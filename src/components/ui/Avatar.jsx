import { getInitials, getAvatarColor } from '../../utils/formatters'

export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name || user.email}
        className={`${sizes[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  const name = user?.full_name || user?.email || ''
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-medium text-white shrink-0 ${getAvatarColor(name)} ${className}`}>
      {getInitials(name)}
    </div>
  )
}
