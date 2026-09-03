import PixelDecoration from './PixelDecoration.jsx'

function HeroSection() {
  return (
    <header className="homepage-hero" aria-label="Sujin wish hero">
      <PixelDecoration type="pinkHeart" className="hero-decor hero-decor-heart" />
      <PixelDecoration type="yellowStar" className="hero-decor hero-decor-yellow" />
      <span className="pixel-sparkle floating-decoration hero-sparkle hero-sparkle-one"></span>
      <span className="pixel-star floating-decoration hero-sparkle hero-sparkle-two"></span>

      <div className="hero-title-group">
        <img className="typography-image this-is-for-logo" src="/assets/typography/this-is-for.png" alt="THIS IS FOR" />
        <img className="typography-image sujin-logo" src="/assets/typography/SUJIN.png" alt="SUJIN" />
      </div>

      <div className="hero-character-area">
        <img className="character-image hero-cat-image" src="/assets/characters/catRiku.png" alt="Riku cat character" />
        <div className="hero-cat-speech" aria-label="수진 하트 리쿠">
          수진 ෆ 리쿠
        </div>
      </div>
    </header>
  )
}

export default HeroSection
