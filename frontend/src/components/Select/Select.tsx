import type { FC, SelectHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

import styles from "./Select.module.scss";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

const Select: FC<Props> = ({ className, children, ...props }) => (
  <div className={styles.wrapper}>
    <select className={cn(styles.select, className)} {...props}>
      {children}
    </select>
    <svg
      className={styles.icon}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export default Select;
