import { BookOpen, Coffee, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories, formatEntryDate } from '../lib/entries';

export function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="filters" role="group" aria-label="기록 분류">
      {Object.entries({ all: '전체', ...categories }).map(([key, label]) => (
        <button key={key} type="button" aria-pressed={key === selected} onClick={() => onSelect(key)}>{label}</button>
      ))}
    </div>
  );
}

export function SearchField({ value, onChange }) {
  return (
    <label className="search">
      <Search aria-hidden="true" size={19} />
      <span className="sr-only">기록 검색</span>
      <input type="search" value={value} onChange={event => onChange(event.target.value)}
        placeholder="제목 또는 본문 검색" />
    </label>
  );
}

export function EntryList({ entries }) {
  return (
    <ul className="entries">
      {entries.map(entry => <li key={entry.id}><EntryCard entry={entry} /></li>)}
    </ul>
  );
}

export function EntryCard({ entry }) {
  const Icon = entry.category === 'study' ? BookOpen : Coffee;
  return (
    <Link to={`/entries/${entry.id}`} className="entry-card" viewTransition>
      <span className="entry-icon"><Icon size={20} aria-hidden="true" /></span>
      <div className="entry-card-content">
        <div className="entry-meta"><span className="category">{categories[entry.category]}</span>
          <time dateTime={entry.created_at}>{formatEntryDate(entry.created_at)}</time></div>
        <h2>{entry.title}</h2>
        <p>{entry.body}</p>
      </div>
    </Link>
  );
}
