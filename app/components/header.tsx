import { Menu } from "@base-ui/react";
import { CgLogIn, CgLogOut, CgUser } from "react-icons/cg";
import { Link, useNavigate } from "react-router";
import type { Me } from "~/api/types/user";
import { UserCard } from "~/components/user-card";
import { useSignOut } from "~/hooks/use-auth";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";

export function Header({ user }: { user: Me | null }) {
  const signOutMutation = useSignOut();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5">
      <div>
        <Link to="/">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Beatok
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Beat battle
          </p>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/lobbies/new">
          <Button>Create lobby</Button>
        </Link>
        {user ? (
          <Menu.Root>
            <Menu.Trigger className="focus:outline-none group">
              <div className="hover:bg-black/5 dark:hover:bg-white/5 rounded-lg px-3 py-1.5 transition cursor-pointer flex items-center">
                <UserCard user={user} className="is-md pointer-events-none" />
              </div>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end" sideOffset={8}>
                <Menu.Popup className="sys-popup min-w-50">
                  <Menu.Item
                    className="sys-popup-item w-full flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <CgUser className="text-lg" /> Profile
                  </Menu.Item>
                  <Menu.Item
                    className="sys-popup-item w-full flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300"
                    onClick={() => signOutMutation.mutate()}
                  >
                    <CgLogOut className="text-lg" /> Sign out
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        ) : (
          <Link to="/signin">
            <Button>
              <CgLogIn />
            </Button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
