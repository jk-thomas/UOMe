
export default function Header({ onMenuClick, title }) {
  return (
    <header className="header">
      <button className="menu-btn" onClick={onMenuClick}>
        ☰
      </button>
      <h1 className="title">{title}</h1>
      <div className="spacer" />
    </header>
  );
}
