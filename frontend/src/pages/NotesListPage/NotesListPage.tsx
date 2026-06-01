import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";
import { Link } from "react-router";

import { api } from "@/api/api";
import Card from "@/components/Card";
import CardSkeleton from "@/components/Card/CardSkeleton";

import styles from "./NotesListPage.module.scss";

const NotesListPage: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notes-list"],
    queryFn: () => api.get("/notes/"),
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Notes</h1>
        <Link to="/notes/new" className={styles.newButton}>
          + New Note
        </Link>
      </div>

      <div className={styles.list}>
        {isLoading && new Array(5).fill("").map((_, i) => <CardSkeleton key={`skeleton_${i}`} />)}
        {data?.map((note) => (
          <Card
            key={note.id}
            id={note.id}
            createdAt={String(note.createdAt)}
            patientName={note.patient.name}
            mrn={note.patient.mrn}
            content={note.rawText}
            doctor={note.patient.primaryPhysician}
            hasSoap={!!note.processedText}
            hasAudio={!!note.audioFilePath}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesListPage;
