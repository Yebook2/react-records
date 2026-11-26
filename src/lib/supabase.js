import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function initialize() {
  if (!url || !key || !key.startsWith('sb_publishable_')) {
    return { client: null, configurationError: 'Supabase URL과 Publishable Key를 설정해 주세요.' };
  }
  try {
    return { client: createClient(url, key), configurationError: null };
  } catch {
    return { client: null, configurationError: 'Supabase 프로젝트 URL 형식을 확인해 주세요.' };
  }
}

export const { client, configurationError } = initialize();
