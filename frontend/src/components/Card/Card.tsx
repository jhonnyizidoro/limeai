import type { FC } from "react";
import { Link } from "react-router";

import styles from "./Card.module.scss";

type Props = {
  id: string;
  patientName: string;
  createdAt: string;
  mrn: string;
  content: string | null;
  doctor: string | null;
  hasSoap: boolean;
  hasAudio: boolean;
};

const Card: FC<Props> = ({
  id,
  patientName,
  createdAt,
  doctor,
  mrn,
  content,
  hasSoap,
  hasAudio,
}) => (
  <Link className={styles.card} to={`/notes/${id}`}>
    <div className={styles.cardHeader}>
      <span className={styles.patientName}>{patientName}</span>
      <span className={styles.date}>
        {new Date(createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    </div>
    <div className={styles.meta}>
      <span>MRN: {mrn}</span>
      {doctor && <span>Dr. {doctor}</span>}
    </div>
    {content ? (
      <p className={styles.preview}>{content}</p>
    ) : (
      <p className={styles.emptyPreview}>No content yet</p>
    )}
    {(hasSoap || hasAudio) && (
      <div className={styles.badges}>
        {hasSoap && <span className={styles.soapBadge}>SOAP</span>}
        {hasAudio && (
          <span className={styles.audioBadge} title="Has audio">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-7 9a7 7 0 0 0 14 0h2a9 9 0 0 1-8 8.94V23h-2v-2.06A9 9 0 0 1 3 12h2z" />
            </svg>
            Audio
          </span>
        )}
      </div>
    )}
  </Link>
);

export default Card;
