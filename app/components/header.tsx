import { Link, useParams } from "react-router";
import { useSignOut } from "~/api/auth";
import type { Me } from "~/api/types/user/me";
import { UserCard } from "~/components/user-card";
import { ActionButton } from "./action-button";
import { Button } from "./button";

export function Header({ user }: { user?: Me }) {
  const signOutMutation = useSignOut();
  const params = useParams();

  return (
    <header className="flex justify-between items-center p-6 border-b border-white/5">
      <div>
        <Link to="/">
          <h1 className="text-xl font-bold">Beatok</h1>
        </Link>
        <p className="mt-1 text-sm text-gray-400">
          Find your perfect beat making session
        </p>
      </div>
      <div className="flex items-center gap-3">
        {user && params.id !== user.id && <UserCard user={user} className="is-md" />}
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
