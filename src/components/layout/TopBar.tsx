interface Props {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  return (
    <header className="top-header">
      <button
        className="mobile-menu-btn"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="top-bar-brand">
        <img
          src="/logo.png"
          alt="Building Entrepreneurs"
          className="top-bar-logo"
        />
        <div className="top-bar-text">
          <span className="top-bar-title">Building Entrepreneurs</span>
          <span className="top-bar-slogan">Creating Great Minds For Youths</span>
        </div>
      </div>
    </header>
  );
}