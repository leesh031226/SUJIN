const assetMap = {
  greenStar: '/assets/decor/greenStar.png',
  yellowStar: '/assets/decor/yellowStar.png',
  pinkHeart: '/assets/decor/pinkHeart.png',
}

function PixelDecoration({ type = 'greenStar', className = '', alt = '' }) {
  const src = assetMap[type] ?? assetMap.greenStar
  const decorationClassName = ['decor-image', 'pixel-decoration-image', className]
    .filter(Boolean)
    .join(' ')

  return <img className={decorationClassName} src={src} alt={alt} />
}

export default PixelDecoration
