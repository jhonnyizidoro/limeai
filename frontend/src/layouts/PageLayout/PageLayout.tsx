import type { FC } from "react";
import { Outlet } from "react-router";

import styles from "./PageLayout.module.scss";

const PageLayout: FC = () => {
  return (
    <div className={styles.wrapper}>
      <Outlet />
    </div>
  );
};

export default PageLayout;
