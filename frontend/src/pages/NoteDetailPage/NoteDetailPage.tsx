import { useQuery } from "@tanstack/react-query";
import { type FC } from "react";
import { Link, useParams } from "react-router";

import { api } from "@/api/api";
import Skeleton from "@/components/Skeleton";

import styles from "./NoteDetailPage.module.scss";

const NoteDetailPage: FC = () => {
  const params = useParams();
  const id = String(params.id || "");

  const { data: note, isLoading } = useQuery({
    queryKey: ["note", id],
    enabled: !!id,
    queryFn: () => api.get("/notes/{id}", { params: { id } }),
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Note details</h1>
        <Link to="/" className={styles.backButton}>
          ← Back to notes
        </Link>
      </div>

      {isLoading ? (
        <div className={styles.sections}>
          <Skeleton height={160} isParent>
            <Skeleton height={14} width="25%" />
            <Skeleton height={20} width="45%" />
            <Skeleton height={16} width="60%" />
            <Skeleton height={16} width="50%" />
          </Skeleton>
          <Skeleton height={360} isParent>
            <Skeleton height={14} width="20%" />
            <Skeleton height={16} />
            <Skeleton height={16} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={16} />
            <Skeleton height={16} width="85%" />
          </Skeleton>
        </div>
      ) : note ? (
        <div className={styles.sections}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Patient</h2>
            <div className={styles.patientGrid}>
              <div className={styles.field}>
                <span className={styles.label}>Name</span>
                <span className={styles.value}>{note.patient.name}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>MRN</span>
                <span className={styles.value}>{note.patient.mrn}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Date of Birth</span>
                <span className={styles.value}>
                  {new Date(note.patient.dob as string).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Gender</span>
                <span className={styles.value}>{note.patient.gender}</span>
              </div>
              {note.patient.phone && (
                <div className={styles.field}>
                  <span className={styles.label}>Phone</span>
                  <span className={styles.value}>{note.patient.phone}</span>
                </div>
              )}
              {note.patient.address && (
                <div className={styles.field}>
                  <span className={styles.label}>Address</span>
                  <span className={styles.value}>{note.patient.address}</span>
                </div>
              )}
              {note.patient.insuranceProvider && (
                <div className={styles.field}>
                  <span className={styles.label}>Insurance</span>
                  <span className={styles.value}>
                    {note.patient.insuranceProvider}
                    {note.patient.insuranceId ? ` — ${note.patient.insuranceId}` : ""}
                  </span>
                </div>
              )}
              {note.patient.primaryPhysician && (
                <div className={styles.field}>
                  <span className={styles.label}>Primary Physician</span>
                  <span className={styles.value}>Dr. {note.patient.primaryPhysician}</span>
                </div>
              )}
              {note.patient.emergencyContactName && (
                <div className={styles.field}>
                  <span className={styles.label}>Emergency Contact</span>
                  <span className={styles.value}>
                    {note.patient.emergencyContactName}
                    {note.patient.emergencyContactPhone
                      ? ` — ${note.patient.emergencyContactPhone}`
                      : ""}
                  </span>
                </div>
              )}
            </div>
            <span className={styles.noteDate}>
              Created{" "}
              {new Date(note.createdAt as string).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </section>

          {note.audioFilePath && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Audio Recording</h2>
              <audio className={styles.audioPlayer} controls src={note.audioFilePath} />
            </section>
          )}

          {note.processedText && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>SOAP Note</h2>
              <pre className={styles.soapText}>{note.processedText}</pre>
            </section>
          )}

          {note.rawText && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Raw Transcript</h2>
              <p className={styles.rawText}>{note.rawText}</p>
            </section>
          )}
        </div>
      ) : (
        <p className={styles.notFound}>Note not found.</p>
      )}
    </div>
  );
};

export default NoteDetailPage;
