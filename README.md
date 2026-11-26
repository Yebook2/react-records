# 예북이의 기록장

[공개 서비스 열기](https://react-records-five.vercel.app/) · [GitHub 소스](https://github.com/Yebook2/react-records)

공부와 일상 기록을 작성하고, 찾고, 고치고, 삭제하는 React SPA입니다. 핵심 데이터는 Supabase의 `entries` 테이블에 저장합니다. 게스트 접속 후 같은 브라우저에서 기록을 다시 열 수 있습니다.

기술 스택은 React 19, React Router 7, Vite 7, JavaScript, CSS, Supabase Auth, Supabase Data API, PostgreSQL입니다.

## 로컬에서 실행하기

Node.js 22.12 이상과 Supabase 프로젝트가 필요합니다.

1. Supabase 프로젝트의 **SQL Editor**에서 [스키마 파일](supabase/migrations/20261127000000_create_entries.sql)을 한 번 실행합니다.
2. **Authentication** 설정에서 **Anonymous Sign-Ins**를 활성화합니다.
3. 프로젝트 URL과 `sb_publishable_`로 시작하는 Publishable Key를 준비합니다.
4. 프로젝트 폴더에서 아래 명령을 실행합니다. 복사한 `.env.local`에 두 값을 채운 뒤 개발 서버를 시작합니다.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

터미널에 표시된 주소를 엽니다. **기록 → 게스트로 시작 → 새 기록** 순으로 이동하면 작성할 수 있습니다.

| 환경변수 | 입력할 값 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase 클라이언트용 Publishable Key |

`VITE_` 변수는 브라우저 번들에서 읽을 수 있습니다. 서버용 Secret 및 Service Role 키는 프로젝트에 넣지 않습니다. `.env`와 `.env.local` 등은 Git에서 제외하며, 변수명만 있는 [환경변수 예시](.env.example)는 저장소에서 공유합니다. [Supabase 데이터 접근 공식 문서](https://supabase.com/docs/guides/database/secure-data)

프로덕션 빌드를 로컬에서 확인하려면 `npm run build` 후 `npm run preview`를 실행합니다.

## 라우트와 이동 경로

[라우터](src/App.jsx)는 React Router의 Data 모드로 동작하며 모든 페이지에 공통 [Layout](src/components/Layout.jsx)을 적용합니다. 브라우저가 View Transition API를 지원하면 링크 이동 및 저장·삭제 후 이동에 화면 전환이 적용됩니다. 헤더의 홈, 기록, 소개, 새 기록으로 주요 화면을 열 수 있습니다. 기록 카드는 상세로, 상세의 수정 링크는 편집으로 연결됩니다.

| 경로 | 페이지 컴포넌트 | 이동 방법 |
| --- | --- | --- |
| `/` | `HomePage` | 헤더의 홈 |
| `/login` | `LoginPage` | 게스트 세션 없이 기록 메뉴에 진입 |
| `/about` | `AboutPage` | 헤더의 소개 |
| `/entries` | `EntriesPage` | 헤더의 기록 |
| `/entries/new` | `NewEntryPage` | 새 기록 버튼 |
| `/entries/:id` | `EntryPage` | 목록의 기록 카드 또는 저장 완료 |
| `/entries/:id/edit` | `EditEntryPage` | 상세의 수정 |
| `*` | `NotFoundPage` | 위 경로와 일치하지 않는 주소 |

기록 경로는 `RequireSession`으로 보호합니다. 접속 완료 후 최초 요청 경로로 돌아갑니다. 직접 입력하거나 새로고침한 URL은 Vercel SPA 재작성 설정을 통해 같은 React 라우터에서 해석됩니다. 일치하는 상세 경로에서 행이 없으면 공통 빈 화면으로 안내합니다.

## 폴더 역할

| 폴더 | 역할 | 예시 |
| --- | --- | --- |
| `src/pages` | 라우트의 화면 조합, 저장 결과에 따른 이동 | [EntryPages.jsx](src/pages/EntryPages.jsx) |
| `src/components` | 재사용 UI와 공통 레이아웃 | [ui.jsx](src/components/ui.jsx), [EntryForm.jsx](src/components/EntryForm.jsx) |
| `src/hooks` | 조회 요청의 수명과 상태, 전역 세션 | [useEntries.js](src/hooks/useEntries.js), [useSession.jsx](src/hooks/useSession.jsx) |
| `src/lib` | Supabase 클라이언트, 데이터 호출, 검증 규칙 | [entries.js](src/lib/entries.js), [supabase.js](src/lib/supabase.js) |
| `supabase/migrations` | 스키마, 제약조건, 사용자별 접근 정책 | [테이블 및 RLS](supabase/migrations/20261127000000_create_entries.sql) |

같은 패턴이 여러 화면에서 필요하거나, 폼처럼 자체 상태와 책임이 뚜렷할 때 컴포넌트로 나눴습니다. 페이지는 어떤 데이터를 불러올지와 저장 후 어디로 갈지를 담당합니다.

## 재사용 컴포넌트와 props

| 컴포넌트 | 전달하는 props 예 | 재사용 |
| --- | --- | --- |
| `Button` | `tone="danger"`, `busy={deleting}`, `onClick` | 접속, 저장, 삭제, 재시도 |
| `ActionLink` | `to="/entries"`, `tone="secondary"` | 헤더, 취소, 목록 복귀 |
| `PageHeading` | `title`, `description`, `action` | 목록, 상세, 작성, 소개 등 |
| `Loading` | `label` | 세션 확인, 목록 및 상세 요청 |
| `ErrorState` | `message`, `onRetry` | 세션, 조회, 저장, 삭제 실패 |
| `EmptyState` | `title`, `description`, `action` | 빈 목록, 검색 결과 없음, 없는 기록, 404 |
| `QueryState` | `query`, `label`, `error`, `isEmpty`, `empty`, `children` | 목록, 상세, 수정 |
| `Field` | `name`, `label`, `value`, `onChange`, `multiline`, `error` | 작성 및 수정 폼의 제목과 본문 |
| `EntryForm` | `initialEntry`, `onSave`, `cancelTo` | 작성 및 수정 |

## props, state, 데이터 흐름

컴포넌트는 props로 상위에서 내려온 값과 콜백을 받습니다. 반면 state는 렌더링 사이에 React가 보존하며, 소유 컴포넌트가 setter로 갱신합니다. 여러 곳에서 같은 값이 필요하면 가장 가까운 공통 부모에 둡니다.

- 목록은 필터와 검색어를 `EntriesPage`에 둡니다. 현재 값과 setter를 필터, 검색 컴포넌트에 내려줍니다. 자식에서 `onSelect(key)`를 호출하면 상위 state가 바뀌고 필터 선택과 목록이 함께 갱신됩니다.
- 제목, 본문과 분류는 `EntryForm`에 둡니다. 입력과 미리보기가 같은 값으로 렌더링됩니다. 저장 이벤트에서 검증한 값을 `onSave(values)`로 페이지에 올려 보냅니다. 페이지가 해당 CRUD 호출과 이동을 담당합니다.
- 목록과 상세의 조회 상태는 `useEntries()`, `useEntry(id)`에서 관리합니다. 여러 라우트가 공유하는 세션은 `SessionProvider`의 Context로 제공합니다.
- `useMemo`를 사용해 조회 결과, 분류, 검색어가 같을 때 필터 계산 결과를 재사용합니다.

### useEffect와 의존성

`useEntries()`는 `useQuery(listEntries)`를, `useEntry(id)`는 `useQuery(getEntry, id)`를 사용합니다. Effect는 화면이 커밋된 뒤 최초 요청을 시작합니다. 로더, 기록 ID 또는 재시도 횟수가 달라지면 React가 직전 Effect의 정리 함수를 실행한 뒤 새 요청을 시작합니다. 라우트를 떠날 때도 요청을 취소합니다. 개발 모드의 StrictMode는 초기 Effect를 한 번 더 설정·정리할 수 있으므로 완료 시점에 취소 여부를 확인합니다.

```jsx
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
```

### 비동기 상태

| 상태 | 렌더링 |
| --- | --- |
| `loading` | 첫 조회, 다른 ID, 재시도 시 공통 스피너와 문구 |
| `error` | 요청 실패 문구와 재시도 버튼 |
| `success`와 데이터 있음 | 목록, 상세 또는 초기값이 채워진 수정 폼 |
| `success`와 데이터 없음 | 빈 목록 또는 찾을 수 없는 기록 안내 |

작성과 수정은 `validateEntry`를 공유합니다. 공백만 있는 제목과 본문을 거부하고 제목 80자, 본문 4,000자로 제한합니다. 검증 실패는 필드 옆에 표시합니다. 저장 중에는 버튼과 입력이 비활성화됩니다. 요청 실패 시 안내를 표시하고 입력값은 유지합니다.

### 상태가 화면을 바꾸는 사례

| 사용자 이벤트 | 코드 | 화면 변화 |
| --- | --- | --- |
| 공부 또는 일상 필터 선택 | `onSelect(key)` → `setCategory(key)` → `useMemo(..., [entries, category, search])` | 선택 버튼 상태, 기록 목록과 개수 갱신 |
| 제목이나 본문 입력 | `setValues(previous => ({ ...previous, [name]: value }))` → `values.title`, `values.body` | 폼 입력과 미리보기 동시 갱신 |
| 저장 클릭 | `setSubmitting(true)` → `<Button busy={submitting}>` | 스피너, 저장 중 문구, 버튼 비활성화 |
| 저장 성공 | `navigate(상세경로, { state: { notice: '새 기록을 저장했습니다.' } })` | 상세 라우트가 원격 행을 다시 조회하고 완료 메시지 표시 |

작성 전체 흐름은 `/entries/new` → `NewEntryPage` → `EntryForm` 입력 및 검증 → `onSave` 제출 → `createEntry`의 Supabase INSERT → 상세 이동 → `useEntry(id)` 조회 → 상세 렌더링입니다.

### Supabase를 선택한 이유

공부·일상 두 분류의 기록을 SQL 테이블 한 개로 모델링할 수 있고, React에서 Supabase SDK로 조회와 변경을 처리할 수 있어 선택했습니다. [CRUD 모듈](src/lib/entries.js)은 목록 SELECT, UUID 기반 상세 SELECT, INSERT, UPDATE, DELETE를 같은 테이블에 실행합니다. 삭제 성공 후 목록 페이지가 다시 조회합니다.

연동에서 고려한 점은 브라우저용 키만으로 사용자 구분을 할 수 없다는 점과, 호스팅에서 상세 URL로 직접 들어가도 React까지 요청이 전달되어야 한다는 점입니다. Supabase Auth의 익명 사용자 ID와 RLS를 조합해 기록을 소유자별로 분리했습니다. 운영 호스팅에는 [Vercel 재작성 설정](vercel.json)을 준비했습니다. 게스트 기록에 대한 액세스는 기존 브라우저 세션에 의존합니다. [Supabase 익명 로그인 문서](https://supabase.com/docs/guides/auth/auth-anonymous) · [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

## 배포 및 제출 확인

- 공개 서비스는 [react-records-five.vercel.app](https://react-records-five.vercel.app/)에서 열 수 있습니다.
- 제출용 소스는 [GitHub 저장소](https://github.com/Yebook2/react-records)에 있습니다.
- 호스팅은 Vercel Hobby, 데이터베이스와 인증은 Supabase Free를 사용합니다.

현재 배포는 운영 Supabase 환경변수를 적용해 Vite로 빌드한 정적 파일을 Vercel에 업로드했습니다. Vercel 프로젝트의 Production에도 같은 변수 두 개를 등록했습니다. GitHub 저장소를 가져와 Vercel에서 직접 빌드하려면 아래 순서를 사용합니다.

1. Vercel에서 저장소를 가져오고 Vite 프로젝트로 설정합니다. 두 환경변수를 Production 환경에 등록한 뒤 배포합니다.
2. 외부 브라우저에서 배포 URL과 `/about` 직접 접근을 확인합니다. 아래 순서로 원격 동작을 검증합니다.
   - `/entries`에 직접 접속하고 게스트로 시작한 뒤 빈 목록을 확인합니다.
   - 새 기록의 빈 폼을 제출하고 필드 오류를 확인합니다. 제목과 본문 입력 후 저장하여 상세 URL을 복사합니다.
   - 상세 주소를 새로고침하고 저장 값을 확인합니다. 수정 후 새 제목과 분류가 표시되는지 확인합니다.
   - 목록에서 분류 및 검색으로 결과를 확인합니다. 상세로 이동해 테스트 기록을 삭제합니다.
   - 복사한 상세 주소에서 기록 없음, `/unknown/page`에서 Not Found 화면을 확인합니다.

### 확인한 결과

| 범위 | 결과 |
| --- | --- |
| 프로덕션 빌드 | `npm run build` 통과 |
| 로컬 브라우저 | 테스트용 Supabase API 응답과 PGlite를 사용해 게스트 접근, CRUD, 상세 새로고침, 검색·필터, 404, 빈 상태, 폼 검증, 제출 중 비활성화, 목록·저장 실패 및 재시도 확인 |
| 데이터베이스 정책 | PGlite에서 SQL 마이그레이션 실행, 소유자 CRUD, 다른 사용자의 조회·수정·삭제 차단, 미인증 조회 차단, 빈 제목 거부 확인 |
| 운영 Supabase | 실제 프로젝트에서 게스트 인증, 등록·조회·수정·삭제, 다른 게스트의 조회·수정·삭제 차단 확인 |
| 공개 배포 | Vercel 주소에서 직접 경로 진입, 게스트 접속, 폼 검증, 등록, 상세 새로고침, 수정, 검색·필터, 삭제, 빈 목록, Not Found 확인 |

## 평가 항목별 근거

| 항목 | 확인 위치 |
| --- | --- |
| #1 라우트와 Not Found | [App.jsx](src/App.jsx)와 위 라우트 표 |
| #2 원격 CRUD | [entries.js](src/lib/entries.js), [EntryPages.jsx](src/pages/EntryPages.jsx) |
| #3 로딩·오류·빈 상태 | [ui.jsx](src/components/ui.jsx)의 `Loading`, `ErrorState`, `EmptyState` |
| #4 폼 검증 및 제출 상태 | [EntryForm.jsx](src/components/EntryForm.jsx)와 위 비동기 상태 설명 |
| #5 배포와 환경변수 | [공개 서비스](https://react-records-five.vercel.app/), 위 운영 검증 결과, [.env.example](.env.example), [vercel.json](vercel.json) |
| #6 조회 커스텀 훅 | [useEntries.js](src/hooks/useEntries.js) |
| #7 구조 분리 | 위 폴더 역할 표 |
| #8 8개 이상의 공통 컴포넌트 | 위 재사용 컴포넌트와 props 표 |
| #9 화면별 공통 패턴 | [EntryPages.jsx](src/pages/EntryPages.jsx)의 목록 및 상세·수정 `QueryState` |
| #10 props와 state | 위 props, state, 데이터 흐름 |
| #11 useEffect 의존성 | 위 useEffect 설명과 코드 |
| #12 비동기 패턴 | 위 비동기 상태 표 |
| #13 렌더링 사례 3개 이상 | 위 상태가 화면을 바꾸는 사례 표 |
| #14 라우터와 전체 기능 흐름 | 위 라우트 표와 작성 전체 흐름 |
| #15 백엔드 선택과 인증 | 위 Supabase 선택 이유와 [SQL 정책](supabase/migrations/20261127000000_create_entries.sql) |

## 공개 배포 CRUD 화면 증빙

2026년 11월 27일 [공개 서비스](https://react-records-five.vercel.app/)에서 같은 테스트 기록을 등록하고, 상세 주소를 새로고침해 조회한 뒤 제목을 수정하고 삭제했습니다. 캡처 순서는 등록, 조회, 수정, 삭제입니다.

제목과 본문의 필수값·길이 오류는 각 입력 필드 옆에 표시합니다. 원격 저장 요청이 실패하면 입력값을 유지하고 폼 공통 오류 영역에 재시도 안내를 표시합니다.

<img width="2028" height="1047" alt="image" src="https://github.com/user-attachments/assets/0f331856-8006-4419-abb7-4ab28affed1a" />


<img width="1913" height="1066" alt="image" src="https://github.com/user-attachments/assets/9d33e456-043e-4b03-bc5e-122d32ba5e6a" />


<img width="1950" height="1052" alt="image" src="https://github.com/user-attachments/assets/9e656593-7e33-4e85-959d-139de94d57fd" />
