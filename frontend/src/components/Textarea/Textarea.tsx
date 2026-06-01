import type { FC, TextareaHTMLAttributes } from "react";

import { cn } from "@/utils/cn";

import styles from "./Textarea.module.scss";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea: FC<Props> = ({ className, ...props }) => (
  <textarea className={cn(styles.textarea, className)} {...props} />
);

export default Textarea;
