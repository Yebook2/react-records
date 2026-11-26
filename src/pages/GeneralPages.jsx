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
          <h1>예북이의 기록장</h1>
          <p>공부한 내용과 취미 생활을 기록합니다.</p>
          <div className="actions">
            <ActionLink to="/entries/new"><Plus size={18} aria-hidden="true" />글 쓰기</ActionLink>
            <ActionLink tone="secondary" to="/entries">내 기록 보기</ActionLink>
          </div>
        </div>
        <div className="notebook" aria-hidden="true"><span /><BookOpenText size={74} strokeWidth={1.2} /></div>
      </section>
      <div className="feature-grid">
        <section className="feature"><BookOpen aria-hidden="true" /><h2>공부</h2><p>공부하면서 정리한 내용과 문제 풀이</p></section>
        <section className="feature"><Coffee aria-hidden="true" /><h2>일상</h2><p>취미 생활과 일상 기록</p></section>
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
      <PageHeading title="게스트로 시작하기" description="게스트로 접속하면 기록을 쓰고 다시 열 수 있습니다." />
      {status === 'loading' && <Loading label="접속 상태를 확인하는 중입니다." />}
      {status === 'error' && <ErrorState message={error} onRetry={retry} />}
      {status === 'ready' && (
        <section className="panel prose">
          <h2>게스트 접속</h2>
          <p>이메일 없이 이용할 수 있습니다. 기록은 처음 접속한 브라우저에서 다시 열 수 있습니다.</p>
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
      <PageHeading title="기록장 소개" />
      <section className="panel prose">
        <h2>공부와 일상</h2>
        <p>공부한 내용과 취미 생활을 정리하는 개인 기록장입니다. 기록은 제목과 본문으로 검색할 수 있습니다.</p>
        <h2>기록을 볼 수 있는 사람</h2>
        <p>기록은 작성한 게스트만 볼 수 있습니다.</p>
        <ActionLink to="/entries">내 기록 보기</ActionLink>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageHeading title="페이지를 찾을 수 없습니다." />
      <EmptyState title="잘못된 주소" description="주소를 확인해 주세요."
        action={<ActionLink to="/">홈으로</ActionLink>} />
    </>
  );
}
