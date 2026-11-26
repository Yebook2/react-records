import { useEffect, useRef } from 'react';
import { BookOpenText, Plus } from 'lucide-react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { ActionLink, ErrorState, Loading } from './ui';

export function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null);
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip" href="#main">본문으로</a>
      <header className="shell-header">
        <div className="shell-width topbar">
          <Link className="brand" to="/" viewTransition><BookOpenText size={22} aria-hidden="true" />예북이의 기록장</Link>
          <nav aria-label="주요 메뉴">
            <NavLink viewTransition to="/" end>홈</NavLink>
            <NavLink viewTransition to="/entries">기록</NavLink>
            <NavLink viewTransition to="/about">소개</NavLink>
          </nav>
          <ActionLink to="/entries/new"><Plus size={17} aria-hidden="true" />새 기록</ActionLink>
        </div>
      </header>
      <main ref={main} id="main" tabIndex={-1} className="shell-width main"><Outlet /></main>
      <footer className="shell-width footer"><BookOpenText size={18} aria-hidden="true" /> 예북이의 기록장</footer>
    </>
  );
}

export function RequireSession() {
  const { status, session, error, retry } = useSession();
  const { pathname } = useLocation();

  if (status === 'loading') return <Loading label="접속 상태를 확인하는 중입니다." />;
  if (status === 'error') return <ErrorState message={error} onRetry={retry} />;
  if (!session) return <Navigate to="/login" replace state={{ from: pathname }} />;
  return <Outlet key={session.user.id} />;
}
