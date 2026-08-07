function Intro({ onNext }) {
  return (
    <section className="scene">
      <h1>Intro</h1>
      <button type="button" onClick={onNext}>
        Next
      </button>
    </section>
  )
}

export default Intro
