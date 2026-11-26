import { createContext, useContext, useEffect, useState } from 'react';
import { client, configurationError } from '../lib/supabase';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [state, setState] = useState(
    configurationError ? { status: 'error', error: configurationError } : { status: 'loading' },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!client) return;
    let active = true;
    let receivedChange = false;
    const acceptSession = session => setState({ status: 'ready', session });

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION' && active) {
        receivedChange = true;
        acceptSession(session);
      }
    });

    client.auth.getSession().then(({ data, error }) => {
      if (!active || receivedChange) return;
      if (error) setState({ status: 'error', error: '이전 접속 상태를 불러오지 못했습니다.' });
      else acceptSession(data.session);
    }).catch(() => {
      if (active && !receivedChange) {
        setState({ status: 'error', error: '이전 접속 상태를 불러오지 못했습니다.' });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [attempt]);

  const retry = client ? () => {
    setState({ status: 'loading' });
    setAttempt(value => value + 1);
  } : undefined;

  return <SessionContext.Provider value={{ ...state, retry }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
