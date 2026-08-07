function DecoCard({ onNext }) {
  return (
    <section className="scene">
      <h1>Deco Card</h1>
      <button type="button" onClick={onNext}>
        Next
      </button>
    </section>
  )
}

export default DecoCard
