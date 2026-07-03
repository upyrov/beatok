import { Link, useNavigate } from "react-router";
import { useSignUp } from "../../api/auth";

export default function Signup() {
  const navigate = useNavigate();
  const signUpMutation = useSignUp();

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signUpMutation.mutate(
      { name, email, password },
      { onSuccess: () => navigate("/") },
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {signUpMutation.isError && (
          <div className="bg-red-100 text-red-600 p-2 rounded">
            {signUpMutation.error?.message || "Failed to sign up"}
          </div>
        )}
        <label className="flex flex-col">
          Name
          <input
            name="name"
            placeholder="John Doe"
            required
            className="border p-2 rounded"
          />
        </label>
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
          disabled={signUpMutation.isPending}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {signUpMutation.isPending ? "Signing up..." : "Sign up"}
        </button>
      </form>

      <Link to="/signin" className="text-blue-500 hover:underline mt-4 block">
        Already have an account?
      </Link>
    </>
  );
}
