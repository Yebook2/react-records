import { AlertCircle, BookOpen, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Button({ children, tone = 'primary', busy = false, disabled, type = 'button', ...props }) {
  return (
    <button {...props} type={type} className={`button button--${tone}`} disabled={disabled || busy} aria-busy={busy || undefined}>
      {busy && <LoaderCircle aria-hidden="true" className="spinner" size={17} />}
      {children}
    </button>
  );
}

export function ActionLink({ to, children, tone = 'primary' }) {
  return <Link viewTransition className={`button button--${tone}`} to={to}>{children}</Link>;
}

export function PageHeading({ title, description, action }) {
  return (
    <header className="page-heading">
      <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
      {action}
    </header>
  );
}

export function Loading({ label }) {
  return <div className="state" role="status"><LoaderCircle aria-hidden="true" className="spinner" />{label}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state--error">
      <p role="alert"><AlertCircle aria-hidden="true" size={20} />{message}</p>
      {onRetry && <Button tone="secondary" onClick={onRetry}>다시 시도</Button>}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <section className="state">
      <BookOpen aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function QueryState({ query, label, error, isEmpty, empty, children }) {
  if (query.status === 'loading') return <Loading label={label} />;
  if (query.status === 'error') return <ErrorState message={error} onRetry={query.retry} />;
  if (isEmpty(query.data)) return empty;
  return children(query.data);
}

export function Field({ name, label, error, multiline, ...props }) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <div className="field">
      <label htmlFor={name}>{label} <span className="required" aria-label="필수">*</span></label>
      <Control {...props} required id={name} name={name} aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined} />
      {error && <p id={`${name}-error`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}
