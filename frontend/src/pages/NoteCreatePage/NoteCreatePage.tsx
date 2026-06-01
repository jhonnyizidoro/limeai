import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FC, useState } from "react";
import { Link, useNavigate } from "react-router";

import { api } from "@/api/api";
import FileInput from "@/components/FileInput/FileInput";
import Select from "@/components/Select/Select";
import Spinner from "@/components/Spinner";
import Textarea from "@/components/Textarea/Textarea";
import { cn } from "@/utils/cn";

import styles from "./NoteCreatePage.module.scss";

type InputMode = "text" | "audio";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const NoteCreatePage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<InputMode>("text");
  const [patientId, setPatientId] = useState("");
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get("/patients/"),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (mode === "audio") {
        if (!audioFile) throw new Error("No audio file selected");
        const audioBase64 = await fileToBase64(audioFile);
        return api.post("/notes/", { body: { patientId, audioBase64 } });
      }
      return api.post("/notes/", { body: { patientId, text } });
    },
    onSuccess: (note) => {
      queryClient.setQueryData(["notes-list"], (prev: (typeof note)[] | undefined) => [
        ...(prev ?? []),
        note,
      ]);
      navigate(`/`);
    },
  });

  const canSubmit =
    patientId && (mode === "text" ? text.trim().length > 0 : audioFile !== null) && !isPending;

  return (
    <div>
      {isPending && <Spinner />}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>New Note</h1>
        <Link to="/" className={styles.backButton}>
          ← Back to notes
        </Link>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
      >
        <div className={styles.field}>
          <label className={styles.label} htmlFor="patient">
            Patient
          </label>
          <Select
            id="patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            disabled={patientsLoading}
          >
            <option value="">Select a patient…</option>
            {patients?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.toggle}>
          <button
            type="button"
            className={cn(styles.toggleBtn, mode === "text" && styles.active)}
            onClick={() => setMode("text")}
          >
            Text
          </button>
          <button
            type="button"
            className={cn(styles.toggleBtn, mode === "audio" && styles.active)}
            onClick={() => setMode("audio")}
          >
            Audio
          </button>
        </div>

        {mode === "text" ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="note-text">
              Note
            </label>
            <Textarea
              id="note-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Enter clinical note…"
              required
            />
          </div>
        ) : (
          <div className={styles.field}>
            <label className={styles.label}>Audio file</label>
            <FileInput
              id="audio"
              accept="audio/*"
              required={mode === "audio"}
              file={audioFile}
              onChange={setAudioFile}
            />
          </div>
        )}

        {error && <p className={styles.error}>{error.message}</p>}

        <button type="submit" className={styles.submit} disabled={!canSubmit}>
          {isPending ? "Saving…" : "Create Note"}
        </button>
      </form>
    </div>
  );
};

export default NoteCreatePage;
