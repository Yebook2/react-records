import { client } from './supabase';

export const categories = { study: '공부', life: '일상' };
export const limits = { title: 80, body: 4000 };
const fields = 'id,category,title,body,created_at';
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const dateFormat = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeZone: 'Asia/Seoul' });

export function formatEntryDate(value) {
  return dateFormat.format(new Date(value));
}

async function read(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listEntries(_id, signal) {
  const entries = [];
  const pageSize = 250;
  while (true) {
    const page = await read(client.from('entries').select(fields)
      .order('created_at', { ascending: false }).order('id', { ascending: false })
      .range(entries.length, entries.length + pageSize - 1).abortSignal(signal));
    entries.push(...page);
    if (page.length < pageSize) return entries;
  }
}

export async function getEntry(id, signal) {
  if (!uuid.test(id)) return null;
  return read(client.from('entries').select(fields).eq('id', id).maybeSingle().abortSignal(signal));
}

export function createEntry(values) {
  return read(client.from('entries').insert(values).select('id').single());
}

export async function updateEntry(id, values) {
  const row = await read(client.from('entries').update(values).eq('id', id).select('id').maybeSingle());
  if (!row) throw new Error('수정할 기록을 찾을 수 없습니다.');
  return row;
}

export async function deleteEntry(id) {
  const row = await read(client.from('entries').delete().eq('id', id).select('id').maybeSingle());
  if (!row) throw new Error('삭제할 기록을 찾을 수 없습니다.');
}

export function validateEntry(values) {
  const errors = {};
  for (const [name, label] of [['title', '제목'], ['body', '본문']]) {
    const length = values[name].trim().length;
    if (!length) errors[name] = `${label}을 입력해 주세요.`;
    else if (length > limits[name]) errors[name] = `${limits[name]}자 이내로 입력해 주세요.`;
  }
  return errors;
}
