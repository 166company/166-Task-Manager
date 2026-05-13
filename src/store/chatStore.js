import { create } from 'zustand'
import { chatService } from '../services/chatService'

export const useChatStore = create((set, get) => ({
  open: false,
  activeTab: 'channels',
  channels: [],
  activeChannelId: null,
  messages: {},
  dmUserId: null,
  dmMessages: [],
  unreadCounts: {},
  subscriptions: {},

  toggleChat: () => set(s => ({ open: !s.open })),
  closeChat: () => set({ open: false }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadChannels: async (workspaceId) => {
    const channels = await chatService.getChannels(workspaceId)
    set({ channels })
  },

  ensureWorkspaceChannel: async (workspaceId, workspaceName) => {
    const ch = await chatService.ensureWorkspaceChannel(workspaceId, workspaceName)
    set(s => ({ channels: s.channels.find(c => c.id === ch.id) ? s.channels : [ch, ...s.channels] }))
    return ch
  },

  ensureProjectChannel: async (workspaceId, projectId, projectName) => {
    const ch = await chatService.ensureProjectChannel(workspaceId, projectId, projectName)
    set(s => ({ channels: s.channels.find(c => c.id === ch.id) ? s.channels : [...s.channels, ch] }))
    return ch
  },

  openChannel: async (channelId) => {
    set({ activeChannelId: channelId, dmUserId: null, activeTab: 'channels' })
    const { subscriptions } = get()

    // Unsubscribe old channel subscription
    const prevSub = subscriptions[`ch_${channelId}`]

    if (!get().messages[channelId]) {
      const msgs = await chatService.getMessages(channelId)
      set(s => ({ messages: { ...s.messages, [channelId]: msgs } }))
    }

    // Subscribe to new messages
    const sub = chatService.subscribeToChannel(
      channelId,
      (msg) => set(s => ({
        messages: {
          ...s.messages,
          [channelId]: [...(s.messages[channelId] || []), msg],
        },
      })),
      (id) => set(s => ({
        messages: {
          ...s.messages,
          [channelId]: (s.messages[channelId] || []).filter(m => m.id !== id),
        },
      }))
    )
    set(s => ({ subscriptions: { ...s.subscriptions, [`ch_${channelId}`]: sub } }))
  },

  sendMessage: async (channelId, userId, content) => {
    await chatService.sendMessage(channelId, userId, content)
  },

  deleteMessage: async (channelId, messageId) => {
    await chatService.deleteMessage(messageId)
  },

  openDM: async (currentUserId, otherUserId) => {
    set({ dmUserId: otherUserId, activeChannelId: null, activeTab: 'dm', open: true })
    const msgs = await chatService.getDirectMessages(currentUserId, otherUserId)
    set({ dmMessages: msgs })
    await chatService.markDirectMessagesRead(currentUserId, otherUserId)
    set(s => ({ unreadCounts: { ...s.unreadCounts, [otherUserId]: 0 } }))
  },

  sendDM: async (fromUserId, toUserId, content) => {
    const msg = await chatService.sendDirectMessage(fromUserId, toUserId, content)
    set(s => ({ dmMessages: [...s.dmMessages, msg] }))
  },

  initDMSubscription: (userId) => {
    const sub = chatService.subscribeToDirectMessages(userId, (msg) => {
      const { dmUserId } = get()
      if (dmUserId === msg.from_user_id) {
        set(s => ({ dmMessages: [...s.dmMessages, msg] }))
        chatService.markDirectMessagesRead(userId, msg.from_user_id)
      } else {
        set(s => ({
          unreadCounts: { ...s.unreadCounts, [msg.from_user_id]: (s.unreadCounts[msg.from_user_id] || 0) + 1 },
        }))
      }
    })
    set(s => ({ subscriptions: { ...s.subscriptions, dm: sub } }))
  },

  loadUnreadCounts: async (userId) => {
    const counts = await chatService.getUnreadCounts(userId)
    set({ unreadCounts: counts })
  },

  cleanup: () => {
    const { subscriptions } = get()
    Object.values(subscriptions).forEach(sub => chatService.unsubscribe(sub))
    set({ subscriptions: {}, channels: [], messages: {}, dmMessages: [], activeChannelId: null, dmUserId: null })
  },
}))
