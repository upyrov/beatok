import { Link, useNavigate } from "react-router";
import { useSignIn } from "../../api/auth";

export default function Signin() {
  const navigate = useNavigate();
  const signInMutation = useSignIn();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signInMutation.mutate(
      { email, password },
      { onSuccess: () => navigate("/") },
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {signInMutation.isError && (
          <div className="bg-red-100 text-red-600 p-2 rounded">
            {signInMutation.error?.message || "Failed to sign in"}
          </div>
        )}
        <label className="flex flex-col">
          Email
          <input
            name="email"
            type="email"
            placeholder="email@beatok.xyz"
            required
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          Password
          <input
            name="password"
            type="password"
            placeholder="Secret123!"
            required
            className="border p-2 rounded"
          />
        </label>
        <button
          type="submit"
          disabled={signInMutation.isPending}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {signInMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <Link to="/signup" className="text-blue-500 hover:underline mt-4 block">
        Don't have an account?
      </Link>
    </>
  );
}
