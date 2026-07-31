import { Link } from "react-router";
import { useSignOut } from "~/api/auth";
import { useUser } from "~/api/users";
import { UserCard } from "~/components/user-card";

const CR_BUTTON_CLASSES =
  "px-4 py-1.5 h-auto min-h-[28px] bg-linear-to-b from-[#5c656d] to-[#495158] hover:from-[#656e76] hover:to-[#515961] active:from-[#434a51] active:to-[#3e444a] border border-[#2b3035] rounded text-[#e0e4e8] text-[13px] font-medium flex items-center justify-center cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.3)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] transition-colors duration-100";

export function Header() {
  const { data: user } = useUser();
  const signOutMutation = useSignOut();

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
        {user && <UserCard user={user} size="sm" />}
        <Link to="/new-lobby" className={CR_BUTTON_CLASSES}>
          Create Lobby
        </Link>
        {user ? (
          <>
            <button
              onClick={() => signOutMutation.mutate()}
              className={CR_BUTTON_CLASSES}
            >
              Sign out
            </button>
          </>
        ) : (
          <Link to="/signin" className={CR_BUTTON_CLASSES}>
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
