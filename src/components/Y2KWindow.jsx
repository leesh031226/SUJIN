import './Y2KWindow.css'

const colorClassNames = {
  pink: 'y2k-window-pink',
  blue: 'y2k-window-blue',
  lavender: 'y2k-window-lavender',
  green: 'y2k-window-green',
}

function Y2KWindow({ title, color = 'pink', children, className = '' }) {
  const colorClassName = colorClassNames[color] ?? colorClassNames.pink
  const windowClassName = ['y2k-window', colorClassName, className].filter(Boolean).join(' ')

  return (
    <section className={windowClassName}>
      <header className="y2k-window-titlebar">
        <span className="y2k-window-title">{title}</span>
        <span className="y2k-window-controls" aria-hidden="true">
          <span className="y2k-window-control y2k-window-minimize"></span>
          <span className="y2k-window-control y2k-window-maximize"></span>
          <span className="y2k-window-control y2k-window-close"></span>
        </span>
      </header>
      <div className="y2k-window-body">{children}</div>
    </section>
  )
}

export default Y2KWindow
