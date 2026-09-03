import { useEffect, useRef, useState } from 'react'

const starPositions = [
  { left: '18%', top: '58%' },
  { left: '68%', top: '34%' },
  { left: '42%', top: '66%' },
  { left: '76%', top: '60%' },
  { left: '28%', top: '30%' },
  { left: '55%', top: '42%' },
  { left: '36%', top: '52%' },
  { left: '63%', top: '70%' },
]

const getResultMessage = (score) => {
  if (score <= 2) {
    return '행운 충전 중... ♡'
  }

  if (score <= 5) {
    return '오늘 꽤 행운인데? ★'
  }

  return 'SUPER LUCKY SUJIN! ★★★'
}

function MiniGame() {
  const [gameStatus, setGameStatus] = useState('ready')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const [starStep, setStarStep] = useState(0)
  const [isStarPopping, setIsStarPopping] = useState(false)
  const popTimerRef = useRef(null)

  useEffect(() => {
    if (gameStatus !== 'playing') {
      return undefined
    }

    const countdown = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(countdown)
          setGameStatus('finished')
          return 0
        }

        return currentTime - 1
      })
    }, 1000)

    return () => window.clearInterval(countdown)
  }, [gameStatus])

  useEffect(() => () => window.clearTimeout(popTimerRef.current), [])

  const startGame = () => {
    window.clearTimeout(popTimerRef.current)
    setGameStatus('playing')
    setScore(0)
    setTimeLeft(5)
    setStarStep(0)
    setIsStarPopping(false)
  }

  const collectStar = () => {
    if (gameStatus !== 'playing' || isStarPopping) {
      return
    }

    setScore((currentScore) => currentScore + 1)
    setIsStarPopping(true)

    popTimerRef.current = window.setTimeout(() => {
      setStarStep((currentStep) => (currentStep + 1) % starPositions.length)
      setIsStarPopping(false)
    }, 150)
  }

  const currentStarPosition = starPositions[starStep]
  const resultMessage = getResultMessage(score)

  return (
    <section className="mini-game-section" aria-label="Lucky game preview">
      <div className="tamagotchi-shell">
        <div className="tamagotchi-screen">
          <span className="pixel-badge">LUCKY GAME</span>

          {gameStatus === 'ready' && (
            <>
              <img className="decor-image mini-game-star" src="/assets/decor/greenStar.png" alt="" />
              <p className="pixel-text">READY?</p>
            </>
          )}

          {gameStatus === 'playing' && (
            <div className="lucky-game-play">
              <div className="lucky-game-status">
                <span>LUCKY ★ {score}</span>
                <span>{timeLeft}s</span>
              </div>
              <button
                className={`lucky-click-star ${isStarPopping ? 'lucky-click-star-pop' : ''}`}
                type="button"
                style={currentStarPosition}
                onClick={collectStar}
                aria-label="Collect lucky star"
              >
                <img src="/assets/decor/yellowStar.png" alt="" />
                {isStarPopping && <span className="lucky-plus-one">+1</span>}
              </button>
            </div>
          )}

          {gameStatus === 'finished' && (
            <div className="lucky-game-result">
              <span className="lucky-final-score">★ × {score}</span>
              <p>{resultMessage}</p>
              <p>리쿠가 행운을 보내줬어!</p>
              <span className="lucky-ending-message">GOOD LUCK, SUJIN ♡</span>
            </div>
          )}
        </div>
        <div className="tamagotchi-controls" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <button className="game-button mini-game-start" type="button" onClick={startGame} disabled={gameStatus === 'playing'}>
          {gameStatus === 'finished' ? 'ONE MORE?' : gameStatus === 'playing' ? 'CATCH!' : 'START'}
        </button>
      </div>
    </section>
  )
}

export default MiniGame
