import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import MembersList from '../components/workspace/MembersList'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import IconPicker, { ICONS } from '../components/ui/IconPicker'
import ColorPicker from '../components/ui/ColorPicker'
import { PROJECT_COLORS } from '../utils/constants'

export default function Settings() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const {
    currentWorkspace, workspaces, fetchWorkspaces,
    updateWorkspace, currentProject, fetchLabels,
    createLabel, labels, fetchMembers, members,
  } = useProjectStore()

  const [wsName, setWsName] = useState('')
  const [wsColor, setWsColor] = useState('#4F46E5')
  const [wsIcon, setWsIcon] = useState('briefcase')
  const [wsIconColor, setWsIconColor] = useState('#FFFFFF')
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState(PROJECT_COLORS[0])
  const [activeTab, setActiveTab] = useState('workspace')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && workspaces.length === 0) fetchWorkspaces(user.id)
  }, [user])

  useEffect(() => {
    if (currentWorkspace) {
      setWsName(currentWorkspace.name || '')
      setWsColor(currentWorkspace.color || '#4F46E5')
      setWsIcon(currentWorkspace.icon || 'briefcase')
      setWsIconColor(currentWorkspace.icon_color || '#FFFFFF')
      fetchMembers(currentWorkspace.id)
    }
  }, [currentWorkspace])

  useEffect(() => {
    if (currentProject) fetchLabels(currentProject.id)
  }, [currentProject])

  const saveWorkspace = async () => {
    if (!currentWorkspace || !wsName.trim()) return
    setSaving(true)
    try {
      await updateWorkspace(currentWorkspace.id, {
        name: wsName.trim(),
        color: wsColor,
        icon: wsIcon,
        icon_color: wsIconColor,
      })
      toast.success(t('success.saved'))
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const addLabel = async (e) => {
    e.preventDefault()
    if (!labelName.trim() || !currentProject) return
    try {
      await createLabel(currentProject.id, labelName.trim(), labelColor)
      setLabelName('')
      toast.success(t('success.created'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const tabs = [
    { key: 'workspace', label: 'Workspace' },
    { key: 'members', label: t('workspace.members') },
    { key: 'labels', label: t('task.labels') },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('nav.settings')}</h2>

          <div className="flex gap-6">
            <div className="w-48 shrink-0">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`sidebar-item w-full ${activeTab === tab.key ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex-1 max-w-xl">
              {activeTab === 'workspace' && (
                <div className="card p-6 space-y-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Workspace parametrləri</h3>

                  {!currentWorkspace && (
                    <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                      Əvvəlcə sol menyudan workspace seçin və ya yaradın
                    </p>
                  )}

                  <Input
                    label="Workspace adı"
                    value={wsName}
                    onChange={e => setWsName(e.target.value)}
                    placeholder="Komanda adı..."
                    disabled={!currentWorkspace}
                  />

                  {/* Icon picker */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">İkon</label>
                    <IconPicker value={wsIcon} onChange={setWsIcon} iconColor={wsIconColor} onIconColorChange={setWsIconColor} />
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Fon rəngi</label>
                    <ColorPicker value={wsColor} onChange={setWsColor} />
                  </div>

                  {/* Preview */}
                  {currentWorkspace && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: wsColor }}>
                        {(() => { const ic = ICONS.find(i => i.iconName === wsIcon); return ic ? <FontAwesomeIcon icon={ic} style={{ color: wsIconColor, width: 20, height: 20 }} /> : <span className="text-xl">{wsIcon}</span> })()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{wsName || 'Workspace adı'}</p>
                        <p className="text-xs text-gray-400">Önizləmə</p>
                      </div>
                    </div>
                  )}

                  <Button onClick={saveWorkspace} loading={saving} disabled={!currentWorkspace}>
                    {t('common.save')}
                  </Button>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('workspace.members')}</h3>
                  {currentWorkspace
                    ? <MembersList />
                    : <p className="text-sm text-gray-400">Əvvəlcə workspace seçin</p>
                  }
                </div>
              )}

              {activeTab === 'labels' && (
                <div className="card p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('task.labels')}</h3>
                  {currentProject ? (
                    <>
                      <form onSubmit={addLabel} className="flex gap-2 items-end">
                        <Input
                          label="Etiket adı"
                          value={labelName}
                          onChange={e => setLabelName(e.target.value)}
                          placeholder="Yeni etiket..."
                          className="flex-1"
                        />
                        <div className="flex gap-1 pb-0.5">
                          {PROJECT_COLORS.slice(0, 8).map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setLabelColor(c)}
                              className={`w-6 h-6 rounded-full transition-all ${labelColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <Button type="submit">Əlavə et</Button>
                      </form>

                      <div className="flex flex-wrap gap-2">
                        {labels.map(l => (
                          <span key={l.id} className="px-3 py-1 rounded-full text-sm text-white font-medium" style={{ backgroundColor: l.color }}>
                            {l.name}
                          </span>
                        ))}
                        {labels.length === 0 && <p className="text-sm text-gray-400">Hələ etiket yoxdur</p>}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Etiket əlavə etmək üçün əvvəlcə bir layihə seçin</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
