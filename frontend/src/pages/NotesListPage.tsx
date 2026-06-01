import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

import { api } from "@/api/api";

const NotesListPage: FC = () => {
  const data = useQuery({
    queryKey: ["notes-list"],
    queryFn: () => api.get("/notes/"),
  });

  return (
    <div>
      <h1>Notes List</h1>
      {data.data?.map((note) => (
        <div className="rounded-sm border">{note.id}</div>
      ))}
    </div>
  );
};

export default NotesListPage;
