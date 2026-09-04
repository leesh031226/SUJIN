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

const ohaasaRevealMessages = ['두근... ♡', '두근두근... ♡♡', '오늘 수진이의 운세는? ✦']

const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)]

const getKstDateString = () => {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`
}

const formatOhaasaDate = (dateString) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)

  if (!match) {
    return ''
  }

  const [, year, month, day] = match
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return `${month}.${day} ${weekdays[date.getDay()]}`
}

const isValidOhaasaData = (data) => {
  if (!data || data.status !== 'success' || !data.date || !data.person || !data.fortune) {
    return false
  }

  const isLibra = data.person.zodiac === 'libra' || data.person.horoscopeCode === '07'

  return Boolean(isLibra && data.fortune.rank !== undefined && data.fortune.rank !== null && data.fortune.messageJa)
}

const splitKoreanSentences = (message) => {
  if (!message) {
    return []
  }

  return message
    .match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? []
}

const getValidOhaasaSourceUrl = (sourceUrl) => {
  if (typeof sourceUrl !== 'string' || !sourceUrl.trim()) {
    return null
  }

  try {
    const url = new URL(sourceUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

const formatOhaasaUpdatedTime = (timestamp) => {
  if (typeof timestamp !== 'string' || !timestamp.trim()) {
    return ''
  }

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
  }).formatToParts(date)
  const timeParts = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${timeParts.hour}:${timeParts.minute}`
}

function Intro() {
  const [isPhotoPopupOpen, setIsPhotoPopupOpen] = useState(false)
  const [isOhaasaPopupOpen, setIsOhaasaPopupOpen] = useState(false)
  const [ohaasaData, setOhaasaData] = useState(null)
  const [isOhaasaLoading, setIsOhaasaLoading] = useState(false)
  const [ohaasaError, setOhaasaError] = useState(null)
  const [hasRevealedOhaasa, setHasRevealedOhaasa] = useState(false)
  const [ohaasaRevealStep, setOhaasaRevealStep] = useState(0)
  const [isUpdateInfoOpen, setIsUpdateInfoOpen] = useState(false)
  const [selectedCardIndex, setSelectedCardIndex] = useState(null)
  const [isPickingCard, setIsPickingCard] = useState(false)
  const [bonusMessage, setBonusMessage] = useState('')
  const pickingTimerRef = useRef(null)
  const ohaasaRevealTimersRef = useRef([])

  useEffect(() => {
    return () => {
      window.clearTimeout(pickingTimerRef.current)
      ohaasaRevealTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    }
  }, [])

  useEffect(() => {
    ohaasaRevealTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    ohaasaRevealTimersRef.current = []

    if (!isOhaasaPopupOpen || hasRevealedOhaasa) {
      return undefined
    }

    setOhaasaRevealStep(0)
    ohaasaRevealTimersRef.current = [
      window.setTimeout(() => setOhaasaRevealStep(1), 900),
      window.setTimeout(() => setOhaasaRevealStep(2), 1800),
      window.setTimeout(() => setHasRevealedOhaasa(true), 2700),
    ]

    return () => {
      ohaasaRevealTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
      ohaasaRevealTimersRef.current = []
    }
  }, [hasRevealedOhaasa, isOhaasaPopupOpen])

  const showBonusMessage = () => {
    setBonusMessage(getRandomItem(bonusMessages))
  }

  const fetchOhaasaData = async () => {
    setIsOhaasaLoading(true)
    setOhaasaError(null)

    try {
      const response = await fetch('/data/ohaasa/latest.json')

      if (!response.ok) {
        throw new Error('Ohaasa response failed')
      }

      const data = await response.json()

      if (!isValidOhaasaData(data)) {
        throw new Error('Ohaasa data is invalid')
      }

      if (data.date !== getKstDateString()) {
        setOhaasaData(null)
        return
      }

      setOhaasaData(data)
    } catch {
      setOhaasaData(null)
      setOhaasaError('error')
    } finally {
      setIsOhaasaLoading(false)
    }
  }

  const openOhaasaPopup = () => {
    setIsOhaasaPopupOpen(true)

    if (!ohaasaData && !isOhaasaLoading) {
      fetchOhaasaData()
    }
  }

  const closeOhaasaPopup = () => {
    setIsOhaasaPopupOpen(false)
    setIsUpdateInfoOpen(false)
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
  const ohaasaZodiacKo = ohaasaData?.person.zodiacKo ?? '천칭자리'
  const ohaasaZodiacJa = ohaasaData?.person.zodiacJa ?? 'てんびん座'
  const ohaasaMessage = ohaasaData?.fortune.messageKo ?? ohaasaData?.fortune.messageJa
  const ohaasaMessageKoSentences = splitKoreanSentences(ohaasaData?.fortune.messageKo)
  const ohaasaLuckyItem = ohaasaData?.fortune.lucky?.itemKo ?? ohaasaData?.fortune.lucky?.itemJa ?? '비밀 아이템 ♡'
  const ohaasaSourceUrl = getValidOhaasaSourceUrl(ohaasaData?.sourceUrl)
  const ohaasaUpdatedTime = formatOhaasaUpdatedTime(ohaasaData?.updatedAt)
  const shouldShowOhaasaReveal = !hasRevealedOhaasa

  return (
    <section className="scene homepage-scene">
      <div className="homepage-shell">
        <HeroSection />

        <Y2KWindow title="FOR SUJIN" color="pink" className="homepage-main-window">
          <div className="main-window-intro">
            <div className="main-window-copy">
              <span className="homepage-label">GOOD LUCK TODAY</span>
              <p>수진이를 위한 응원 페이지 즐겨주시와요 ㅎ-ㅎ</p>
              <button className="ohaasa-trigger" type="button" onClick={openOhaasaPopup}>
                <span>오늘의 오하아사</span>
              </button>
            </div>
            <img className="typography-image main-window-good-luck" src="/assets/typography/good-luck.png" alt="GOOD LUCK!" />
            <PixelDecoration type="greenStar" className="main-window-star" />
          </div>
        </Y2KWindow>

        {isOhaasaPopupOpen && (
          <div className="ohaasa-popup" role="dialog" aria-modal="true" aria-label="Today's Ohaasa horoscope">
            <div className="ohaasa-popup-title">
              <span>⭐ TODAY'S OHAASA</span>
              <div className="popup-window-controls">
                <span aria-hidden="true">□</span>
                <button type="button" onClick={closeOhaasaPopup} aria-label="Close Ohaasa popup">
                  X
                </button>
              </div>
            </div>
            <div className="ohaasa-popup-body">
              <span className="ohaasa-decor ohaasa-decor-star" aria-hidden="true">
                ★
              </span>
              <span className="ohaasa-decor ohaasa-decor-sparkle" aria-hidden="true">
                ✦
              </span>

              <div className="ohaasa-update-info">
                <button
                  className="ohaasa-update-toggle"
                  type="button"
                  aria-expanded={isUpdateInfoOpen}
                  aria-controls="ohaasa-update-panel"
                  onClick={() => setIsUpdateInfoOpen((isOpen) => !isOpen)}
                >
                  ⓘ UPDATE INFO
                </button>
                <div
                  id="ohaasa-update-panel"
                  className={`ohaasa-update-panel${isUpdateInfoOpen ? ' is-open' : ''}`}
                  aria-hidden={!isUpdateInfoOpen}
                >
                  <div className="ohaasa-update-panel-inner">
                    <span>UPDATE INFO</span>
                    <p>오하아사는 매일 아침 자동으로 업데이트돼요.</p>
                    <dl>
                      <div>
                        <dt>업데이트 확인</dt>
                        <dd>08:10 · 08:40 · 09:20 · 10:20</dd>
                      </div>
                      {ohaasaUpdatedTime && (
                        <div>
                          <dt>마지막 업데이트</dt>
                          <dd>{ohaasaUpdatedTime}</dd>
                        </div>
                      )}
                    </dl>
                    <p>원문 공개 시점에 따라 반영이 조금 늦어질 수 있어요.</p>
                  </div>
                </div>
              </div>

              {shouldShowOhaasaReveal && (
                <div className="ohaasa-reveal-card" role="status" aria-live="polite">
                  <span className="ohaasa-reveal-badge">♡ SECRET FORTUNE ♡</span>
                  <p key={ohaasaRevealStep}>{ohaasaRevealMessages[ohaasaRevealStep]}</p>
                  <div className="ohaasa-reveal-sparkles" aria-hidden="true">
                    <i>♡</i>
                    <i>✦</i>
                    <i>★</i>
                  </div>
                </div>
              )}

              {!shouldShowOhaasaReveal && isOhaasaLoading && (
                <div className="ohaasa-status-card" role="status" aria-live="polite">
                  <span className="ohaasa-loading-sparkle">★</span>
                  <p>★ 오늘의 운세를 불러오는 중... ★</p>
                </div>
              )}

              {!shouldShowOhaasaReveal && !isOhaasaLoading && !ohaasaError && !ohaasaData && (
                <div className="ohaasa-status-card ohaasa-fallback-card" role="status">
                  <span>♡ ★ ♡</span>
                  <p>오늘의 오하아사를 아직 가져오지 못했어요 ♡</p>
                  <p>조금 뒤 다시 확인해줘!</p>
                </div>
              )}

              {!shouldShowOhaasaReveal && !isOhaasaLoading && ohaasaError === 'error' && (
                <div className="ohaasa-status-card ohaasa-fallback-card" role="status">
                  <span>✦ ㅠ.ㅠ ✦</span>
                  <p>오하아사를 불러오지 못했어요 ㅠ.ㅠ</p>
                  <p>조금 뒤 다시 확인해줘!</p>
                </div>
              )}

              {!shouldShowOhaasaReveal && !isOhaasaLoading && !ohaasaError && ohaasaData && (
                <div className="ohaasa-result-reveal">
                  <div className="ohaasa-date">{formatOhaasaDate(ohaasaData.date)}</div>

                  <section className="ohaasa-zodiac-card" aria-label="Libra horoscope">
                    <div className="ohaasa-zodiac">♎</div>
                    <h3>{ohaasaZodiacKo}</h3>
                    <p>{ohaasaZodiacJa}</p>
                  </section>

                  <div className="ohaasa-rank">♥ 오늘 {ohaasaData.fortune.rank}위 ♥</div>

                  <section className="ohaasa-message-card">
                    <span>TODAY'S MESSAGE</span>
                    {ohaasaMessageKoSentences.length > 0 ? (
                      <p className="ohaasa-message-ko">
                        {ohaasaMessageKoSentences.map((sentence, index) => (
                          <span key={`${sentence}-${index}`}>{sentence}</span>
                        ))}
                      </p>
                    ) : (
                      <p>{ohaasaMessage}</p>
                    )}
                  </section>

                  <section className="ohaasa-lucky">
                    <span>✦ LUCKY ITEM ✦</span>
                    <p>{ohaasaLuckyItem}</p>
                  </section>

                  {ohaasaSourceUrl && (
                    <a className="ohaasa-source-link" href={ohaasaSourceUrl} target="_blank" rel="noopener noreferrer">
                      오하아사 원문 보기 ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
