import { MessageSquare } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'

export default function ChatButton() {
  const { toggleChat, open, unreadCounts } = useChatStore()
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <button
      onClick={toggleChat}
      className={`fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
        open
          ? 'bg-indigo-700 shadow-indigo-500/40'
          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
      }`}
      title="Chat"
    >
      <MessageSquare className="w-6 h-6 text-white" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1 shadow-md">
          {totalUnread > 9 ? '9+' : totalUnread}
        </span>
      )}
    </button>
  )
}
