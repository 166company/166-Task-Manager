import { supabase } from './supabase'

export const chatService = {
  // Channels
  async getChannels(workspaceId) {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*, project:projects(id, name, icon, color)')
      .eq('workspace_id', workspaceId)
      .order('created_at')
    if (error) throw error
    return data || []
  },

  async createChannel(workspaceId, name, type = 'workspace', projectId = null) {
    const { data, error } = await supabase
      .from('chat_channels')
      .insert({ workspace_id: workspaceId, name, type, project_id: projectId })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async ensureWorkspaceChannel(workspaceId, workspaceName) {
    const { data } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('type', 'workspace')
      .single()
    if (data) return data
    return chatService.createChannel(workspaceId, 'Ümumi', 'workspace')
  },

  async ensureProjectChannel(workspaceId, projectId, projectName) {
    const { data } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('project_id', projectId)
      .single()
    if (data) return data
    return chatService.createChannel(workspaceId, projectName, 'project', projectId)
  },

  // Messages
  async getMessages(channelId, limit = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, user:profiles(id, full_name, avatar_url, email)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  async sendMessage(channelId, userId, content) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ channel_id: channelId, user_id: userId, content })
      .select('*, user:profiles(id, full_name, avatar_url, email)')
      .single()
    if (error) throw error
    return data
  },

  async deleteMessage(id) {
    const { error } = await supabase.from('chat_messages').delete().eq('id', id)
    if (error) throw error
  },

  subscribeToChannel(channelId, onMessage, onDelete) {
    return supabase
      .channel(`chat:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `channel_id=eq.${channelId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('chat_messages')
          .select('*, user:profiles(id, full_name, avatar_url, email)')
          .eq('id', payload.new.id)
          .single()
        if (data) onMessage(data)
      })
      .on('postgres_changes', {
        event: 'DELETE', schema: 'public', table: 'chat_messages',
      }, payload => onDelete(payload.old.id))
      .subscribe()
  },

  // Direct Messages
  async getDirectMessages(userId, otherId) {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*, from_user:profiles!direct_messages_from_user_id_fkey(id, full_name, avatar_url)')
      .or(`and(from_user_id.eq.${userId},to_user_id.eq.${otherId}),and(from_user_id.eq.${otherId},to_user_id.eq.${userId})`)
      .order('created_at', { ascending: true })
      .limit(100)
    if (error) throw error
    return data || []
  },

  async sendDirectMessage(fromUserId, toUserId, content) {
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({ from_user_id: fromUserId, to_user_id: toUserId, content })
      .select('*, from_user:profiles!direct_messages_from_user_id_fkey(id, full_name, avatar_url)')
      .single()
    if (error) throw error
    return data
  },

  async markDirectMessagesRead(userId, otherId) {
    await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('from_user_id', otherId)
      .eq('to_user_id', userId)
      .is('read_at', null)
  },

  async getUnreadCounts(userId) {
    const { data } = await supabase
      .from('direct_messages')
      .select('from_user_id')
      .eq('to_user_id', userId)
      .is('read_at', null)
    const counts = {}
    data?.forEach(m => { counts[m.from_user_id] = (counts[m.from_user_id] || 0) + 1 })
    return counts
  },

  subscribeToDirectMessages(userId, onMessage) {
    return supabase
      .channel(`dm:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `to_user_id=eq.${userId}`,
      }, async (payload) => {
        const { data } = await supabase
          .from('direct_messages')
          .select('*, from_user:profiles!direct_messages_from_user_id_fkey(id, full_name, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) onMessage(data)
      })
      .subscribe()
  },

  unsubscribe(channel) {
    supabase.removeChannel(channel)
  },
}
