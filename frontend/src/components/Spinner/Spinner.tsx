import type { FC } from "react";

import styles from "./Spinner.module.scss";

const Spinner: FC = () => (
  <div className={styles.overlay}>
    <div className={styles.ring} />
  </div>
);

export default Spinner;
