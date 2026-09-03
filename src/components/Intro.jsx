import { useEffect, useRef, useState } from 'react'
import CheerMessage from './CheerMessage.jsx'
import HeroSection from './HeroSection.jsx'
import MiniGame from './MiniGame.jsx'
import PixelDecoration from './PixelDecoration.jsx'
import PolaroidCard from './PolaroidCard.jsx'
import Y2KWindow from './Y2KWindow.jsx'

const rikuCards = [
  {
    image: '/assets/photos/riku/riku1.jpg',
    message: '라멘먹고.. 갈래..?',
  },
  {
    image: '/assets/photos/riku/riku2.jpg',
    message: '힛',
  },
  {
    image: '/assets/photos/riku/riku3.jpg',
    message: '자신이 원하는 대로 해! \n난 항상 긍정하니까',
  },
  {
    image: '/assets/photos/riku/riku4.jpg',
    message:
      '젤 중요한건 다 재밌게 하는거야.\n진짜 즐기고 있는 사람밖에 낼 수 없는 에너지가 있어',
  },
  {
    image: '/assets/photos/riku/riku5.jpg',
    message: '리쿠는 계속 자기의 편이니까',
  },
  {
    image: '/assets/photos/riku/riku6.jpg',
    message: '힘들면 힘들다고 \n 주위 사람들에게 도움을 청하는 거야. \n나도 그럴테니까',
  },
  {
    image: '/assets/photos/riku/riku7.jpg',
    message: '야옹 .. \n 난 너만의 고양이..',
  },
]

const rikuPhotos = rikuCards.map((card) => card.image)

const bonusMessages = [
  '수진아 오늘도 네 편이야 ♡',
  '조금 천천히 가도 괜찮아!',
  '오늘의 행운은 이미 수진이 거야 ★',
  '지금까지 해온 만큼 분명 잘할 수 있어!',
  '리쿠가 응원하고 있어 ෆ',
  'GOOD LUCK! YOU CAN DO IT!',
  '오늘도 반짝이는 하루가 될 거야 ✦',
]

const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)]

function Intro() {
  const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false)
  const [selectedCardIndex, setSelectedCardIndex] = useState(null)
  const [isPickingCard, setIsPickingCard] = useState(false)
  const [bonusMessage, setBonusMessage] = useState('')
  const pickingTimerRef = useRef(null)

  useEffect(() => {
    return () => window.clearTimeout(pickingTimerRef.current)
  }, [])

  const showBonusMessage = () => {
    setBonusMessage(getRandomItem(bonusMessages))
  }

  const drawRikuCard = () => {
    window.clearTimeout(pickingTimerRef.current)
    setIsPickingCard(true)

    const nextCardIndex = selectedCardIndex === null ? 0 : (selectedCardIndex + 1) % rikuCards.length

    pickingTimerRef.current = window.setTimeout(() => {
      setSelectedCardIndex(nextCardIndex)
      setIsPickingCard(false)
    }, 700)
  }

  const selectedCard = selectedCardIndex === null ? null : rikuCards[selectedCardIndex]

  return (
    <section className="scene homepage-scene">
      <div className="homepage-shell">
        <HeroSection />

        <Y2KWindow title="FOR SUJIN" color="pink" className="homepage-main-window">
          <div className="main-window-intro">
            <div className="main-window-copy">
              <span className="homepage-label">GOOD LUCK TODAY</span>
              <p>수진이를 위한 응원 페이지 즐겨주시와요 ㅎ-ㅎ</p>
            </div>
            <img className="typography-image main-window-good-luck" src="/assets/typography/good-luck.png" alt="GOOD LUCK!" />
            <PixelDecoration type="greenStar" className="main-window-star" />
          </div>
        </Y2KWindow>

        <CheerMessage />

        <section className="scrapbook-section" aria-label="Polaroid scrapbook preview">
          <div className="section-heading-sticker">
            <span className="homepage-label">PHOTO BOOK</span>
            <p className="pixel-text">open later...</p>
          </div>

          <div className="polaroid-grid">
            <PolaroidCard
              label="PHOTO CARD"
              variant="blue"
              rotation="left"
              onClick={() => setIsPhotoPopupOpen(true)}
              ariaLabel="Draw a random Riku photo card"
            >
              <img className="riku-polaroid-photo" src={rikuPhotos[0]} alt="Riku photo card preview" />
            </PolaroidCard>
            <PolaroidCard
              label="MESSAGE"
              variant="pink"
              rotation="middle"
              onClick={showBonusMessage}
              ariaLabel="Show a bonus cheering message"
            >
              <img className="riku-polaroid-photo" src={rikuPhotos[1]} alt="Riku message preview" />
            </PolaroidCard>
          </div>

          {bonusMessage && (
            <div className="photo-book-bonus-window photo-book-message-window" role="status">
              <div className="photo-book-window-title">
                <span>♡ MINI MESSAGE</span>
                <button type="button" onClick={() => setBonusMessage('')} aria-label="Close message">
                  X
                </button>
              </div>
              <div className="photo-book-window-body">
                <img className="photo-book-tiny-photo" src={rikuPhotos[1]} alt="Riku bonus message" />
                <p>{bonusMessage}</p>
              </div>
            </div>
          )}

          {isPhotoPopupOpen && (
            <div className="riku-photo-popup" role="dialog" aria-modal="true" aria-label="Random Riku photo card draw">
              <div className="riku-photo-popup-title">
                <span>♡ RIKU PHOTO CARD</span>
                <div className="popup-window-controls">
                  <span aria-hidden="true">□</span>
                  <button type="button" onClick={() => setIsPhotoPopupOpen(false)} aria-label="Close Riku photo popup">
                    X
                  </button>
                </div>
              </div>
              <div className="riku-photo-popup-body">
                <div className="riku-draw-panel">
                  <img className="decor-image riku-draw-decor riku-draw-heart" src="/assets/decor/pinkHeart.png" alt="" />
                  <img className="decor-image riku-draw-decor riku-draw-star" src="/assets/decor/yellowStar.png" alt="" />
                  <img className="decor-image riku-draw-decor riku-draw-sparkle" src="/assets/decor/greenStar.png" alt="" />

                  <div className="riku-draw-copy">
                    <h3>RIKU PHOTO CARD</h3>
                    <p>오늘 수진이에게 온 리쿠의 메시지는?</p>
                  </div>

                  {isPickingCard && (
                    <div className="riku-picking-card" role="status" aria-live="polite">
                      <span>PICKING YOUR RIKU...</span>
                      <div className="riku-picking-sparkles" aria-hidden="true">
                        <i></i>
                        <i></i>
                        <i></i>
                      </div>
                    </div>
                  )}

                  {!isPickingCard && selectedCard && (
                    <article className="riku-drawn-card" aria-live="polite">
                      <div className="riku-drawn-photo-frame">
                        <img className="riku-drawn-photo" src={selectedCard.image} alt="Random Riku photo card" />
                      </div>
                      <p className="riku-drawn-message">{selectedCard.message}</p>
                    </article>
                  )}

                  <button className="riku-draw-button" type="button" onClick={drawRikuCard} disabled={isPickingCard}>
                    {selectedCard ? 'DRAW AGAIN ☆' : 'DRAW CARD ♡'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <MiniGame />
      </div>
    </section>
  )
}

export default Intro
