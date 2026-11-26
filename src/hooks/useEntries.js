import { useEffect, useState } from 'react';
import { getEntry, listEntries } from '../lib/entries';

const loading = { status: 'loading' };

function useQuery(load, id) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const retry = () => setAttempt(value => value + 1);

  useEffect(() => {
    const controller = new AbortController();
    const publish = state => {
      if (!controller.signal.aborted) setResult({ id, attempt, state });
    };

    load(id, controller.signal).then(
      data => publish({ status: 'success', data }),
      () => publish({ status: 'error' }),
    );
    return () => controller.abort();
  }, [load, id, attempt]);

  const current = result?.id === id && result?.attempt === attempt;
  return { ...(current ? result.state : loading), retry };
}

export function useEntries() {
  return useQuery(listEntries);
}

export function useEntry(id) {
  return useQuery(getEntry, id);
}
