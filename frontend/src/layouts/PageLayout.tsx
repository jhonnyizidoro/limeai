import type { FC } from "react";
import { Outlet } from "react-router";

const PageLayout: FC = () => {
  return (
    <div className="mx-auto w-100 max-w-[95%]">
      <Outlet />
    </div>
  );
};

export default PageLayout;
