import { Menu } from "@base-ui/react";
import { CgLogIn, CgLogOut, CgMathPlus, CgUser } from "react-icons/cg";
import { Link, useNavigate } from "react-router";
import type { Me } from "~/api/types/user";
import { Button } from "~/components/ui/button";
import { UserCard } from "~/components/user-card";
import { useSignOut } from "~/hooks/use-auth";
import { ThemeToggle, ThemeToggleMenuItem } from "./theme-toggle";

export function Header({ user }: { user: Me | null }) {
  const signOutMutation = useSignOut();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center h-header px-6 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-40">
      <div>
        <Link viewTransition to="/" className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Beatok
          </h1>
          <span className="text-gray-300 dark:text-gray-600 text-2xl font-light leading-none pb-1">
            |
          </span>
          <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
            Beat Battle
          </p>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link viewTransition to="/lobbies/new">
          <Button>
            <CgMathPlus className="mr-2" /> Create Lobby
          </Button>
        </Link>
        {user ? (
          <Menu.Root>
            <Menu.Trigger className="focus:outline-none group">
              <div className="hover:bg-black/5 dark:hover:bg-white/5 rounded-lg px-3 py-1.5 transition flex items-center">
                <UserCard
                  user={user}
                  className="is-md pointer-events-none"
                  direction="vertical"
                />
              </div>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                side="bottom"
                align="end"
                sideOffset={8}
                className="z-50"
              >
                <Menu.Popup className="system-popup min-w-50">
                  <Menu.Item
                    className="system-popup-item w-full flex items-center gap-2"
                    render={<Link viewTransition to={`/users/${user.id}`} />}
                  >
                    <CgUser className="text-lg" /> Profile
                  </Menu.Item>
                  <ThemeToggleMenuItem />
                  <Menu.Item
                    className="system-popup-item w-full flex items-center gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300"
                    onClick={() => signOutMutation.mutate()}
                  >
                    <CgLogOut className="text-lg" /> Sign out
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        ) : (
          <div className="flex items-center gap-2">
            <Link viewTransition to="/signin">
              <Button variant="outline" size="icon">
                <CgLogIn className="text-lg" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
