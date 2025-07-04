const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-8.156M1.5 2.25l1.5 4.473a2.475 2.475 0 004.288 1.487l4.331-4.148a2.475 2.475 0 014.288 1.487l1.5 4.473M8.25 12l-6 6M15 12l6 6" />
    </svg>
  );
  
  export default function ActiveUsers({ count }) {
      if (count < 1) return null;
      return (
        <div className="icon-button" style={{cursor: 'default'}}>
            <UsersIcon />
            <span>{count} {count === 1 ? 'user' : 'users'}</span>
        </div>
      );
    }