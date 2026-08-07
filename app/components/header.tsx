import { CgLogIn, CgLogOut } from "react-icons/cg";
import { Link, useParams } from "react-router";
import type { Me } from "~/api/types/user/me";
import type { User } from "~/api/types/user/user";
import { UserCard } from "~/components/user-card";
import { useSignOut } from "~/hooks/use-auth";
import { ActionButton } from "./action-button";
import { Button } from "./button";

import { ThemeToggle } from "./theme-toggle";

export function Header({ user }: { user: Me | null }) {
  const signOutMutation = useSignOut();
  const params = useParams();

  return (
    <header className="flex justify-between items-center p-6 border-b border-white/5">
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
        <ThemeToggle />
        <Link to="/lobbies/new">
          <Button>Create lobby</Button>
        </Link>
        {user && params.id !== user.id && (
          <UserCard user={user as User} className="is-md" />
        )}
        {user ? (
          <>
            <ActionButton
              onClick={() => signOutMutation.mutate()}
              isPending={signOutMutation.isPending}
            >
              <CgLogOut />
            </ActionButton>
          </>
        ) : (
          <Link to="/signin">
            <Button>
              <CgLogIn />
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
