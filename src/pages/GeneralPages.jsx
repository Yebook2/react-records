import { useState } from 'react';
import { BookOpen, BookOpenText, Coffee, Plus } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ActionLink, Button, EmptyState, ErrorState, Loading, PageHeading } from '../components/ui';
import { useSession } from '../hooks/useSession';
import { client } from '../lib/supabase';

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>공부와 일상을<br />한 장씩</h1>
          <p>오늘 배운 것, 기억하고 싶은 순간을 기록해 보세요.</p>
          <div className="actions">
            <ActionLink to="/entries/new"><Plus size={18} aria-hidden="true" />새 기록 쓰기</ActionLink>
            <ActionLink tone="secondary" to="/entries">내 기록 보기</ActionLink>
          </div>
        </div>
        <div className="notebook" aria-hidden="true"><span /><BookOpenText size={74} strokeWidth={1.2} /></div>
      </section>
      <div className="feature-grid">
        <section className="feature"><BookOpen aria-hidden="true" /><h2>공부</h2><p>새로 배운 개념이나 문제를 풀며 알게 된 점을 정리하세요.</p></section>
        <section className="feature"><Coffee aria-hidden="true" /><h2>일상</h2><p>취미, 취향, 다시 꺼내 보고 싶은 순간을 남겨 보세요.</p></section>
      </div>
    </>
  );
}

export function LoginPage() {
  const { status, session, error, retry } = useSession();
  const { state } = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const from = typeof state?.from === 'string' && /^\/entries(?:\/|$)/.test(state.from)
    ? state.from : '/entries';

  async function startSession() {
    if (submitting) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const { error } = await client.auth.signInAnonymously();
      if (error) throw error;
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (session) return <Navigate to={from} replace />;
  return (
    <>
      <PageHeading title="기록장 시작하기" description="이 브라우저에서 나만의 기록장을 열 수 있어요." />
      {status === 'loading' && <Loading label="접속 상태를 확인하는 중입니다." />}
      {status === 'error' && <ErrorState message={error} onRetry={retry} />}
      {status === 'ready' && (
        <section className="panel prose">
          <h2>게스트로 이용하기</h2>
          <p>이메일 없이 시작할 수 있어요. 브라우저 데이터를 지우거나 다른 기기로 옮기면 기존 기록에 다시 접근할 수 없어요.</p>
          {failed && <ErrorState message="게스트 접속에 실패했습니다. 연결을 확인한 뒤 다시 시도해 주세요." />}
          <Button onClick={startSession} busy={submitting}>{submitting ? '접속 중…' : '게스트로 시작'}</Button>
        </section>
      )}
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHeading title="기록장 소개" description="공부와 일상에서 발견한 것을 한곳에 모아 두세요." />
      <section className="panel prose">
        <h2>기록장 사용법</h2>
        <p>새 기록에서 분류, 제목, 본문을 입력하고 저장하세요. 기록 목록에서 제목이나 본문으로 검색하고, 상세 화면에서 수정하거나 삭제할 수 있어요.</p>
        <h2>기록을 볼 수 있는 사람</h2>
        <p>게스트 세션별로 기록을 구분합니다. 같은 브라우저에서 접속하면 저장한 기록에 다시 접근할 수 있어요.</p>
        <ActionLink to="/entries">내 기록 보기</ActionLink>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageHeading title="페이지를 찾을 수 없어요" />
      <EmptyState title="잘못된 주소" description="주소를 확인하거나 홈에서 다시 시작해 주세요."
        action={<ActionLink to="/">홈으로</ActionLink>} />
    </>
  );
}
