import { Outlet, useOutletContext } from "react-router";
import { Header } from "~/components/header";
import type { Me } from "~/api/types/user/me";

export default function Layout() {
  const context = useOutletContext<{ user: Me | null }>();

  return (
    <>
      <Header />
      <Outlet context={context} />
    </>
  );
}
