import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBriefcase, faCode, faDesktop, faGlobe, faHeart, faHome,
  faLightbulb, faMobileAlt, faPalette, faRocket, faStar, faTrophy,
  faUsers, faWrench, faChartBar, faCamera, faBook, faFlag,
  faCog, faLeaf, faMusic, faPen, faPlane, faShieldAlt,
  faShoppingCart, faStore, faTag, faBolt, faCloud, faCrown,
  faFire, faGraduationCap, faHammer, faHashtag, faHeadphones,
  faKey, faLaptop, faLayerGroup, faLink, faMap, faMedal,
  faMicrochip, faMicrophone, faPaperPlane, faPlug, faPuzzlePiece,
  faRecycle, faRobot, faSearch, faServer, faSeedling,
  faSlidersH, faSuitcase, faTablet, faTerminal, faTv,
  faUmbrella, faVial, faWallet, faWifi, faBoxes, faBullseye,
  faChartPie, faChartLine, faClipboard, faCompass, faDatabase,
  faEnvelope, faFlask, faFolderOpen, faGift, faHandshake,
  faInfinity, faLock, faSearchPlus, faBell, faCalendarAlt,
  faClock, faCommentAlt, faThumbsUp, faAnchor, faAtom,
  faBinoculars, faBug, faBuilding, faBullhorn, faCalculator,
  faChess, faChild, faCoffee, faCoins, faCubes, faDice,
  faDumbbell, faFeather, faFighterJet, faGamepad, faGem,
  faGlasses, faHandPointer, faIndustry, faMapMarkedAlt,
  faMountain, faPizzaSlice, faProjectDiagram, faRainbow, faRunning,
  faShip, faSnowflake, faSpaceShuttle, faTachometerAlt,
  faTree, faTruck, faUserGraduate, faUserTie, faWind,
} from '@fortawesome/free-solid-svg-icons'

export const ICONS = [
  faBriefcase, faRocket, faLightbulb, faBullseye, faBolt, faFire, faGem, faStar, faPalette, faWrench,
  faChartBar, faChartLine, faChartPie, faCode, faDesktop, faLaptop, faMicrochip, faServer, faDatabase, faTerminal,
  faPen, faClipboard, faBook, faFolderOpen, faTag, faLink, faHashtag, faEnvelope, faBell, faCalendarAlt,
  faClock, faCommentAlt, faUsers, faHandshake, faHeart, faThumbsUp, faMedal, faTrophy, faCrown, faGraduationCap,
  faGlobe, faMap, faCompass, faPlane, faUmbrella, faSeedling, faLeaf, faRecycle, faCloud, faWifi,
  faShieldAlt, faLock, faKey, faCog, faSlidersH, faPuzzlePiece, faPlug, faRobot, faMicrophone, faHeadphones,
  faShoppingCart, faStore, faWallet, faCoins, faGift, faSuitcase, faFlag, faCamera, faMusic, faMobileAlt,
  faTablet, faTv, faLayerGroup, faFlask, faVial, faSearchPlus, faInfinity, faBoxes, faHome, faPaperPlane,
  faAnchor, faAtom, faBinoculars, faBug, faBuilding, faBullhorn, faCalculator, faChess, faCoffee, faCubes,
  faDice, faDumbbell, faFeather, faFighterJet, faGamepad, faGlasses, faHandPointer, faIndustry, faMapMarkedAlt,
  faMountain, faPizzaSlice, faProjectDiagram, faRainbow, faRunning, faShip, faSnowflake, faSpaceShuttle,
  faTachometerAlt, faTree, faTruck, faUserGraduate, faUserTie, faWind, faSearch, faChild,
]

const PRESET_COLORS = [
  '#FFFFFF', '#F9FAFB', '#FEF3C7', '#FEE2E2', '#EDE9FE', '#DBEAFE',
  '#D1FAE5', '#FCE7F3', '#111827', '#374151', '#1D4ED8', '#7C3AED',
  '#DC2626', '#D97706', '#059669', '#DB2777',
]

export default function IconPicker({ value, onChange, iconColor, onIconColorChange }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('icon')

  const filtered = ICONS.filter(ic =>
    !search || ic.iconName.toLowerCase().includes(search.toLowerCase())
  )

  const selectedIcon = ICONS.find(i => i.iconName === value) || ICONS[0]
  const currentIconColor = iconColor || '#FFFFFF'

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 mb-3">
        <button
          type="button"
          onClick={() => setTab('icon')}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${tab === 'icon' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          İkon seç
        </button>
        <button
          type="button"
          onClick={() => setTab('color')}
          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${tab === 'color' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          İkon rəngi
        </button>
      </div>

      {tab === 'icon' ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'transparent', border: '1px solid #e5e7eb' }}>
              <FontAwesomeIcon icon={selectedIcon} style={{ color: currentIconColor === '#FFFFFF' ? '#374151' : currentIconColor }} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="İkon axtar..."
              className="input flex-1 text-sm py-1.5"
            />
          </div>
          <div className="grid grid-cols-10 gap-1 max-h-44 overflow-y-auto scrollbar-thin p-1 rounded-lg border border-gray-200 dark:border-gray-600">
            {filtered.map(ic => (
              <button
                key={ic.iconName}
                type="button"
                title={ic.iconName}
                onClick={() => onChange(ic.iconName)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm
                  ${value === ic.iconName
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 ring-2 ring-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <FontAwesomeIcon icon={ic} />
              </button>
            ))}
            {filtered.length === 0 && <div className="col-span-10 text-center py-4 text-sm text-gray-400">Tapılmadı</div>}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">İkonun özünün rəngi (ön plan)</p>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer">
              <div className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm" style={{ backgroundColor: currentIconColor }} />
              <input
                type="color"
                value={currentIconColor}
                onChange={e => onIconColorChange?.(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
            <input
              value={currentIconColor}
              onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onIconColorChange?.(e.target.value) }}
              className="input flex-1 font-mono text-sm uppercase"
              placeholder="#FFFFFF"
              maxLength={7}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => onIconColorChange?.(c)}
                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${currentIconColor === c ? 'border-gray-500 scale-110' : 'border-gray-200 dark:border-gray-600'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <FontAwesomeIcon icon={selectedIcon} style={{ color: currentIconColor, width: 20, height: 20 }} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Önizləmə (indigo fon)</span>
          </div>
        </div>
      )}
    </div>
  )
}
