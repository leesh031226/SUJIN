function DecoCard({ onNext }) {
  return (
    <section className="scene">
      <div className="scene-inner paper-card">
        <span className="mini-label">Scene 05</span>
        <h1 className="scene-title">Deco Card</h1>
        <p className="scene-subtitle">Design system preview</p>
        <button className="button-primary" type="button" onClick={onNext}>
          Next
        </button>
      </div>
    </section>
  )
}

export default DecoCard
