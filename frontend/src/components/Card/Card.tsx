import type { FC } from "react";

import styles from "./Card.module.scss";

type Props = {
  patientName: string;
  createdAt: string;
  mrn: string;
  content: string | null;
  doctor: string | null;
};

const Card: FC<Props> = ({ patientName, createdAt, doctor, mrn, content }) => (
  <div className={styles.card}>
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
  </div>
);

export default Card;
