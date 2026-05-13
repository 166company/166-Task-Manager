import { useEffect, useRef, useState } from 'react'
import {
  X, Hash, MessageSquare, Send, Trash2, ChevronDown,
  Users, Plus, AtSign,
} from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useAuthStore } from '../../store/authStore'
import { useProjectStore } from '../../store/projectStore'
import Avatar from '../ui/Avatar'
import { formatRelative } from '../../utils/dateUtils'

function MessageBubble({ msg, isOwn, onDelete }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className={`flex gap-2.5 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Avatar user={msg.user || msg.from_user} size="sm" className="shrink-0 mt-0.5" />
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className="flex items-center gap-2">
          {!isOwn && (
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {(msg.user || msg.from_user)?.full_name || (msg.user || msg.from_user)?.email}
            </span>
          )}
          <span className="text-xs text-gray-400">{formatRelative(msg.created_at)}</span>
        </div>
        <div className={`relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-tl-sm shadow-sm'
        }`}>
          {msg.content}
          {isOwn && hover && (
            <button
              onClick={() => onDelete(msg.id)}
              className="absolute -left-7 top-1/2 -translate-y-1/2 p-1 rounded text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageInput({ onSend, placeholder = 'Mesaj yaz...' }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
    inputRef.current?.focus()
  }

  return (
    <div className="p-3 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-600 focus-within:border-indigo-400 transition-colors">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
          }}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 max-h-24"
          style={{ minHeight: 24 }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1 ml-1">Enter — göndər · Shift+Enter — yeni sətir</p>
    </div>
  )
}

export default function ChatPanel() {
  const {
    open, closeChat, activeTab, setActiveTab,
    channels, activeChannelId, messages, dmUserId, dmMessages, unreadCounts,
    openChannel, sendMessage, deleteMessage,
    sendDM, loadChannels, ensureWorkspaceChannel,
  } = useChatStore()
  const { user, profile } = useAuthStore()
  const { currentWorkspace, currentProject, members } = useProjectStore()
  const messagesEndRef = useRef(null)
  const [dmTarget, setDmTarget] = useState(null)

  useEffect(() => {
    if (open && currentWorkspace && user) {
      loadChannels(currentWorkspace.id)
      ensureWorkspaceChannel(currentWorkspace.id, currentWorkspace.name)
    }
  }, [open, currentWorkspace?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, dmMessages, activeChannelId, dmUserId])

  useEffect(() => {
    const target = members.find(m => m.user_id === dmUserId)
    setDmTarget(target?.profile || null)
  }, [dmUserId, members])

  if (!open) return null

  const activeChannel = channels.find(c => c.id === activeChannelId)
  const channelMessages = activeChannelId ? (messages[activeChannelId] || []) : []

  const wsChannels = channels.filter(c => c.type === 'workspace')
  const projectChannels = channels.filter(c => c.type === 'project')

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex shadow-2xl">
      {/* Channel/DM List */}
      <div className="w-56 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <span className="font-semibold text-sm">💬 Chat</span>
          <button onClick={closeChat} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {/* Workspace channels */}
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kanallar</p>
            {wsChannels.map(ch => (
              <button
                key={ch.id}
                onClick={() => openChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  activeChannelId === ch.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Hash className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>

          {/* Project channels */}
          {projectChannels.length > 0 && (
            <div className="px-3 mb-1 mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Layihələr</p>
              {projectChannels.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => openChannel(ch.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    activeChannelId === ch.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-sm">{ch.project?.icon || '📋'}</span>
                  <span className="truncate">{ch.project?.name || ch.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Direct Messages */}
          <div className="px-3 mt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Birbaşa mesajlar
              {totalUnread > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">{totalUnread}</span>
              )}
            </p>
            {members.filter(m => m.user_id !== user?.id).map(m => {
              const unread = unreadCounts[m.user_id] || 0
              return (
                <button
                  key={m.user_id}
                  onClick={() => { useChatStore.getState().openDM(user.id, m.user_id); setActiveTab('dm') }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    dmUserId === m.user_id && activeTab === 'dm'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Avatar user={m.profile} size="xs" />
                  </div>
                  <span className="truncate flex-1">{m.profile?.full_name || m.profile?.email}</span>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 rounded-full shrink-0">{unread}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Current project channel button */}
        {currentProject && (
          <div className="p-3 border-t border-gray-700">
            <button
              onClick={async () => {
                const ch = await useChatStore.getState().ensureProjectChannel(
                  currentWorkspace.id, currentProject.id, currentProject.name
                )
                openChannel(ch.id)
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {currentProject.name} kanalı aç
            </button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="w-80 flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
          {activeTab === 'dm' && dmTarget ? (
            <>
              <Avatar user={dmTarget} size="sm" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{dmTarget.full_name || dmTarget.email}</p>
                <p className="text-xs text-gray-400">Birbaşa mesaj</p>
              </div>
            </>
          ) : activeChannel ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                {activeChannel.type === 'project'
                  ? <span>{activeChannel.project?.icon || '📋'}</span>
                  : <Hash className="w-4 h-4 text-indigo-600" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {activeChannel.type === 'project' ? (activeChannel.project?.name || activeChannel.name) : activeChannel.name}
                </p>
                <p className="text-xs text-gray-400">
                  {activeChannel.type === 'workspace' ? 'Workspace kanali' : 'Layihə kanalı'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">Kanal seçin</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {activeTab === 'dm' ? (
            dmMessages.length > 0 ? (
              dmMessages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.from_user_id === user?.id}
                  onDelete={() => {}}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Hələ mesaj yoxdur</p>
                <p className="text-xs mt-1">İlk mesajı siz göndərin</p>
              </div>
            )
          ) : activeChannelId ? (
            channelMessages.length > 0 ? (
              channelMessages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.user_id === user?.id}
                  onDelete={(id) => deleteMessage(activeChannelId, id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8">
                <Hash className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Hələ mesaj yoxdur</p>
                <p className="text-xs mt-1">Söhbəti başladın!</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Sol tərəfdən kanal seçin</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {(activeChannelId || (activeTab === 'dm' && dmUserId)) && (
          <MessageInput
            placeholder={activeTab === 'dm' ? `${dmTarget?.full_name || 'İstifadəçi'}-yə mesaj...` : `#${activeChannel?.name || 'kanala'} mesaj...`}
            onSend={(text) => {
              if (activeTab === 'dm') {
                useChatStore.getState().sendDM(user.id, dmUserId, text)
              } else {
                sendMessage(activeChannelId, user.id, text)
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
