import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useProjectStore } from '../store/projectStore'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import MembersList from '../components/workspace/MembersList'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { PROJECT_COLORS } from '../utils/constants'

export default function Settings() {
  const { t } = useTranslation()
  const { currentWorkspace, updateWorkspace, currentProject, updateProject, fetchLabels, createLabel, labels } = useProjectStore()
  const [wsName, setWsName] = useState(currentWorkspace?.name || '')
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState(PROJECT_COLORS[0])
  const [activeTab, setActiveTab] = useState('workspace')

  const saveWorkspace = async () => {
    if (!currentWorkspace || !wsName.trim()) return
    try {
      await updateWorkspace(currentWorkspace.id, { name: wsName })
      toast.success(t('success.saved'))
    } catch {
      toast.error(t('errors.generic'))
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
            {/* Tab nav */}
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
                <div className="card p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Workspace parametrləri</h3>
                  <Input
                    label="Workspace adı"
                    value={wsName}
                    onChange={e => setWsName(e.target.value)}
                  />
                  <Button onClick={saveWorkspace}>{t('common.save')}</Button>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('workspace.members')}</h3>
                  <MembersList />
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
                        <div className="flex gap-1 mb-0.5">
                          {PROJECT_COLORS.slice(0, 5).map(c => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => setLabelColor(c)}
                              className={`w-6 h-6 rounded-full ${labelColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
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
