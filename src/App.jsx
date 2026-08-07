import { useState } from 'react'
import Intro from './components/Intro.jsx'
import MainWish from './components/MainWish.jsx'
import RikuDraw from './components/RikuDraw.jsx'
import PowerUp from './components/PowerUp.jsx'
import DecoCard from './components/DecoCard.jsx'
import SecretLetter from './components/SecretLetter.jsx'
import Ending from './components/Ending.jsx'

const sceneOrder = [
  'intro',
  'mainWish',
  'rikuDraw',
  'powerUp',
  'decoCard',
  'secretLetter',
  'ending',
]

function App() {
  const [currentScene, setCurrentScene] = useState('intro')
  const [selectedRiku, setSelectedRiku] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [powerUpStats, setPowerUpStats] = useState({})
  const [decorations, setDecorations] = useState([])

  const goToNextScene = () => {
    setCurrentScene((scene) => {
      const currentIndex = sceneOrder.indexOf(scene)
      return sceneOrder[Math.min(currentIndex + 1, sceneOrder.length - 1)]
    })
  }

  const experienceState = {
    selectedRiku,
    selectedMessage,
    powerUpStats,
    decorations,
    setSelectedRiku,
    setSelectedMessage,
    setPowerUpStats,
    setDecorations,
  }

  const sceneProps = {
    onNext: goToNextScene,
    experienceState,
  }

  const scenes = {
    intro: <Intro {...sceneProps} />,
    mainWish: <MainWish {...sceneProps} />,
    rikuDraw: <RikuDraw {...sceneProps} />,
    powerUp: <PowerUp {...sceneProps} />,
    decoCard: <DecoCard {...sceneProps} />,
    secretLetter: <SecretLetter {...sceneProps} />,
    ending: <Ending experienceState={experienceState} />,
  }

  return <main className="app-shell">{scenes[currentScene]}</main>
}

export default App
