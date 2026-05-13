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
  faGlasses, faHandPointer, faHorse, faHospital, faIceCream,
  faIndustry, faKiwiBird, faMapMarkedAlt, faMountain, faPaw,
  faPizzaSlice, faProjectDiagram, faRainbow, faRunning,
  faShip, faSnowflake, faSpaceShuttle, faTachometerAlt,
  faThermometer, faTree, faTruck, faUserGraduate, faUserTie,
  faVirus, faWeight, faWindowRestore, faWind,
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
  faTachometerAlt, faTree, faTruck, faUserGraduate, faUserTie, faWind, faSearch, faMicrophone, faChild,
]

export default function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState('')

  const filtered = ICONS.filter(ic =>
    !search || ic.iconName.toLowerCase().includes(search.toLowerCase())
  )

  const selectedIcon = ICONS.find(i => i.iconName === value) || ICONS[0]

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200">
          <FontAwesomeIcon icon={selectedIcon} className="w-5 h-5" />
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
        {filtered.length === 0 && (
          <div className="col-span-10 text-center py-4 text-sm text-gray-400">İkon tapılmadı</div>
        )}
      </div>
    </div>
  )
}
