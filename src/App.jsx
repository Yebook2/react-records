import { Route, Routes } from 'react-router-dom';
import { Layout, RequireSession } from './components/Layout';
import { AboutPage, HomePage, LoginPage, NotFoundPage } from './pages/GeneralPages';
import { EntriesPage, EntryPage, EditEntryPage, NewEntryPage } from './pages/EntryPages';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route element={<RequireSession />}>
          <Route path="entries" element={<EntriesPage />} />
          <Route path="entries/new" element={<NewEntryPage />} />
          <Route path="entries/:id" element={<EntryPage />} />
          <Route path="entries/:id/edit" element={<EditEntryPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
