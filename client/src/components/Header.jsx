import { Link } from 'react-router-dom';

const HeaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M19.498 4.343a1.5 1.5 0 00-2.122 0l-8.483 8.481a1.5 1.5 0 000 2.122l5.657 5.657a1.5 1.5 0 002.122-2.122l-4.596-4.596 7.422-7.422a1.5 1.5 0 000-2.122zm-2.829 8.485l-4.243-4.243 4.243-4.243-4.243 4.243 4.243 4.243zm-4.242 4.242l1.414-1.414-4.243-4.243-1.414 1.414 4.243 4.243zM4.5 21a1.5 1.5 0 01-1.5-1.5v-9a1.5 1.5 0 011.5-1.5h1.597a1.5 1.5 0 010 3H6v6h6v-1.597a1.5 1.5 0 013 0V19.5a1.5 1.5 0 01-1.5 1.5H4.5z" />
  </svg>
);

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-link">
          <div className="header-icon-wrapper">
            <HeaderIcon />
          </div>
          <h1 className="header-title">SynapseNotes</h1>
        </Link>
      </div>
    </header>
  );
}