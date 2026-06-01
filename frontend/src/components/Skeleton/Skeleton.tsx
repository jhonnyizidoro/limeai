import type { CSSProperties, FC, PropsWithChildren } from "react";

import { cn } from "@/utils/cn";

import styles from "./Skeleton.module.scss";

interface Props {
  className?: string;
  isParent?: boolean;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
}

const Skeleton: FC<PropsWithChildren<Props>> = ({
  className,
  children,
  height,
  width,
  isParent,
}) => (
  <div
    className={cn(styles.skeleton, className, isParent && styles.skeletonParent)}
    style={{ width, height }}
  >
    {children}
  </div>
);

export default Skeleton;
