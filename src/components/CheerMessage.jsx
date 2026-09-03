import { useState } from 'react'
import Y2KWindow from './Y2KWindow.jsx'
import PixelDecoration from './PixelDecoration.jsx'

function CheerMessage() {
  const [isTranslationVisible, setIsTranslationVisible] = useState(false)

  return (
    <section className="cheer-message-section" aria-label="Riku cheer message">
      <div className="cheer-riku-photocard">
        <span className="masking-tape masking-tape-blue"></span>
        <img src="/assets/photos/riku/riku4.jpg" alt="Riku cheering for Sujin" />
        <span>FROM RIKU</span>
      </div>

      <Y2KWindow title="♡ SUJIN'S PAGE" color="green" className="cheer-window">
        <div className="cheer-window-layout">
          <div className="speech-bubble">
            <span className="homepage-label">RIKU MESSAGE</span>
            <p className="riku-message-text">スジン、いつも応援してるよ！</p>
            {isTranslationVisible && <p className="riku-message-translation">수진아 늘 응원해!</p>}
            <button
              className="riku-translate-button"
              type="button"
              onClick={() => setIsTranslationVisible((isVisible) => !isVisible)}
            >
              번역 보기
            </button>
          </div>
          <PixelDecoration type="pinkHeart" className="cheer-heart" />
          <PixelDecoration type="yellowStar" className="cheer-star" />
        </div>
      </Y2KWindow>
    </section>
  )
}

export default CheerMessage
