import { Outlet } from "react-router";

export const handle = {
  sitemap: () => [],
};

export default function AuthLayout() {
  return (
    <div className="h-svh flex flex-col gap-4 justify-center items-center">
      <Outlet />
    </div>
  );
}
