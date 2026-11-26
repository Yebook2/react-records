import { useRef, useState } from 'react';
import { categories, limits, validateEntry } from '../lib/entries';
import { ActionLink, Button, ErrorState, Field } from './ui';

export function EntryForm({ initialEntry, onSave, cancelTo }) {
  const [values, setValues] = useState({
    category: initialEntry?.category ?? 'study',
    title: initialEntry?.title ?? '',
    body: initialEntry?.body ?? '',
  });
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = useRef(false);
  const errors = validated ? validateEntry(values) : {};

  function handleChange(event) {
    const { name, value } = event.target;
    setValues(previous => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    setValidated(true);
    setFailed(false);
    const invalid = Object.keys(validateEntry(values));
    if (invalid.length) {
      event.currentTarget.elements.namedItem(invalid[0])?.focus();
      return;
    }

    pending.current = true;
    setSubmitting(true);
    try {
      await onSave({ ...values, title: values.title.trim(), body: values.body.trim() });
    } catch {
      setFailed(true);
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="editor-grid">
      <form noValidate onSubmit={handleSubmit} className="panel">
        <fieldset disabled={submitting}>
          <div className="field">
            <label htmlFor="category">분류</label>
            <select id="category" name="category" value={values.category} onChange={handleChange}>
              {Object.entries(categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <Field name="title" label="제목" value={values.title} onChange={handleChange}
            placeholder="기록할 일을 한 문장으로" maxLength={limits.title} error={errors.title} />
          <Field name="body" label="본문" multiline rows={8} value={values.body} onChange={handleChange}
            placeholder="오늘 배운 점이나 기억하고 싶은 내용을 적어 보세요." maxLength={limits.body} error={errors.body} />
        </fieldset>
        {failed && <ErrorState message="기록을 저장하지 못했습니다. 연결을 확인한 뒤 다시 저장해 주세요." />}
        <div className="actions form-actions">
          <Button type="submit" busy={submitting}>{submitting ? '저장 중…' : '기록 저장'}</Button>
          {!submitting && <ActionLink to={cancelTo} tone="secondary">취소</ActionLink>}
        </div>
      </form>
      <aside className="panel preview" aria-label="미리보기">
        <h2>미리보기</h2>
        <span className="category">{categories[values.category]}</span>
        <h3>{values.title.trim() || '제목'}</h3>
        <p className="entry-body">{values.body.trim() || '작성한 내용이 여기에 표시됩니다.'}</p>
      </aside>
    </div>
  );
}
