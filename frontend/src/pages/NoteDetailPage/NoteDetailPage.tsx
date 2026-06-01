import type { FC } from "react";
import { useParams } from "react-router";

const NoteDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();

  return <h1>Note #{id}</h1>;
};

export default NoteDetailPage;
