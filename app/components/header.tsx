import { Link, useParams } from "react-router";
import type { Me } from "~/api/types/user/me";
import type { User } from "~/api/types/user/user";
import { UserCard } from "~/components/user-card";
import { useSignOut } from "~/hooks/use-auth";
import { ActionButton } from "./action-button";
import { Button } from "./button";

export function Header({ user }: { user: Me | null }) {
  const signOutMutation = useSignOut();
  const params = useParams();

  return (
    <header className="flex justify-between items-center p-6 border-b border-white/5">
      <div>
        <Link to="/">
          <h1 className="text-2xl font-bold tracking-tight">Beatok</h1>
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {user && params.id !== user.id && (
          <UserCard user={user as User} className="is-md" />
        )}
        <Link to="/lobbies/new">
          <Button>Create Lobby</Button>
        </Link>
        {user ? (
          <>
            <ActionButton
              onClick={() => signOutMutation.mutate()}
              isPending={signOutMutation.isPending}
            >
              Sign out
            </ActionButton>
          </>
        ) : (
          <Link to="/signin">
            <Button>Sign in</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
