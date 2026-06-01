import type { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import PageLayout from "./layouts/PageLayout";
import NoteCreatePage from "./pages/NoteCreatePage";
import NoteDetailPage from "./pages/NoteDetailPage";
import NotesListPage from "./pages/NotesListPage";

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<NotesListPage />} />
          <Route path="notes/new" element={<NoteCreatePage />} />
          <Route path="notes/:id" element={<NoteDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
