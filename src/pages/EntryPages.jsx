import { useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CategoryFilter, EntryList, SearchField } from '../components/EntryList';
import { EntryForm } from '../components/EntryForm';
import { ActionLink, Button, EmptyState, ErrorState, PageHeading, QueryState } from '../components/ui';
import { useEntries, useEntry } from '../hooks/useEntries';
import { categories, createEntry, deleteEntry, formatEntryDate, updateEntry } from '../lib/entries';

function NewEntryLink() {
  return <ActionLink to="/entries/new"><Plus size={17} aria-hidden="true" />기록 쓰기</ActionLink>;
}

export function EntriesPage() {
  const query = useEntries();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { state } = useLocation();
  const entries = query.data;
  const visible = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('ko');
    return (entries ?? []).filter(entry =>
      (category === 'all' || entry.category === category) &&
      `${entry.title}\n${entry.body}`.toLocaleLowerCase('ko').includes(keyword));
  }, [entries, category, search]);

  return (
    <>
      <PageHeading title="내 기록" description="공부와 일상에 남긴 기록을 찾아보세요." action={<NewEntryLink />} />
      {state?.notice && <p className="notice" role="status">{state.notice}</p>}
      <div className="entry-tools">
        <CategoryFilter selected={category} onSelect={setCategory} />
        <SearchField value={search} onChange={setSearch} />
      </div>
      <QueryState query={query} label="기록 목록을 불러오는 중입니다."
        error="기록 목록을 불러오지 못했습니다." isEmpty={rows => rows.length === 0}
        empty={<EmptyState title="아직 기록이 없어요" description="첫 기록을 남겨 보세요." action={<NewEntryLink />} />}>
        {() => visible.length
          ? <><p className="results" role="status">기록 {visible.length}개</p><EntryList entries={visible} /></>
          : <EmptyState title="조건에 맞는 기록이 없어요" description="분류나 검색어를 바꿔 보세요." />}
      </QueryState>
    </>
  );
}

function EntryQuery({ id, children }) {
  const query = useEntry(id);
  return (
    <QueryState query={query} label="기록을 불러오는 중입니다." error="기록을 불러오지 못했습니다."
      isEmpty={entry => entry === null} empty={<EmptyState title="기록을 찾을 수 없어요"
        description="삭제된 기록이거나 현재 세션에서 열 수 없는 기록입니다."
        action={<ActionLink to="/entries">내 기록으로</ActionLink>} />}>
      {children}
    </QueryState>
  );
}

export function EntryPage() {
  const { id } = useParams();
  return <EntryQuery id={id}>{entry => <EntryDetail key={entry.id} entry={entry} />}</EntryQuery>;
}

function EntryDetail({ entry }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);

  async function remove() {
    if (pending.current) return;
    pending.current = true;
    setDeleting(true);
    setFailed(false);
    try {
      await deleteEntry(entry.id);
      navigate('/entries', { replace: true, viewTransition: true, state: { notice: '기록을 삭제했습니다.' } });
    } catch {
      setFailed(true);
    } finally {
      pending.current = false;
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeading title={entry.title} action={<ActionLink to="/entries" tone="secondary">목록으로</ActionLink>} />
      {state?.notice && <p className="notice" role="status">{state.notice}</p>}
      <article className="panel">
        <div className="entry-meta"><span className="category">{categories[entry.category]}</span>
          <time dateTime={entry.created_at}>{formatEntryDate(entry.created_at)}</time></div>
        <p className="entry-body">{entry.body}</p>
      </article>
      {confirm ? (
        <section className="panel confirm" aria-label="삭제 확인">
          <p>이 기록을 삭제할까요? 삭제한 기록은 복구할 수 없어요.</p>
          {failed && <ErrorState message="기록을 삭제하지 못했습니다. 다시 시도해 주세요." />}
          <div className="actions">
            <Button tone="danger" busy={deleting} onClick={remove}>{deleting ? '삭제 중…' : '삭제 확인'}</Button>
            <Button tone="secondary" disabled={deleting} onClick={() => setConfirm(false)}>취소</Button>
          </div>
        </section>
      ) : (
        <div className="actions form-actions">
          <ActionLink to={`/entries/${entry.id}/edit`} tone="secondary">수정</ActionLink>
          <Button tone="quiet" onClick={() => { setFailed(false); setConfirm(true); }}>삭제</Button>
        </div>
      )}
    </>
  );
}

export function NewEntryPage() {
  const navigate = useNavigate();
  async function save(values) {
    const { id } = await createEntry(values);
    navigate(`/entries/${id}`, { replace: true, viewTransition: true, state: { notice: '새 기록을 저장했습니다.' } });
  }
  return (
    <>
      <PageHeading title="새 기록" description="오늘 남기고 싶은 이야기를 적어 보세요." />
      <EntryForm cancelTo="/entries" onSave={save} />
    </>
  );
}

export function EditEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  async function save(values) {
    await updateEntry(id, values);
    navigate(`/entries/${id}`, { replace: true, viewTransition: true, state: { notice: '기록을 수정했습니다.' } });
  }
  return (
    <>
      <PageHeading title="기록 수정" />
      <EntryQuery id={id}>{entry =>
        <EntryForm key={entry.id} initialEntry={entry} cancelTo={`/entries/${id}`} onSave={save} />
      }</EntryQuery>
    </>
  );
}
