import type { FC } from "react";

import Skeleton from "../Skeleton";

const CardSkeleton: FC = () => (
  <Skeleton height={143} isParent>
    <Skeleton height={20} width="50%" />
    <Skeleton height={15} width="70%" />
    <Skeleton height={50} />
  </Skeleton>
);

export default CardSkeleton;
