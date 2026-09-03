function PolaroidCard({ label, variant = 'pink', rotation = 'left', children, onClick, ariaLabel }) {
  const className = ['polaroid-card', `polaroid-card-${variant}`, `polaroid-card-${rotation}`].join(' ')
  const Component = onClick ? 'button' : 'article'

  return (
    <Component className={className} type={onClick ? 'button' : undefined} onClick={onClick} aria-label={ariaLabel}>
      <span className="masking-tape"></span>
      <div className="polaroid-photo-slot">{children}</div>
      <span className="homepage-label polaroid-card-label">{label}</span>
    </Component>
  )
}

export default PolaroidCard
