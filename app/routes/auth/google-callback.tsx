import { redirect, type LoaderFunctionArgs } from "react-router";
import { googleCallback } from "~/api/auth";
import { queryKeys } from "~/api/query-keys";
import { getQueryClient } from "~/lib/query-client";

export async function clientLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  try {
    await googleCallback(url.search);

    const queryClient = getQueryClient();
    queryClient.setQueryData(["auth", "status"], "authenticated");
    queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

    return redirect("/");
  } catch (error) {
    console.error(error);
    return redirect("/auth/signin");
  }
}

export default function GoogleCallback() {
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[50vh] gap-4">
      <p className="text-gray-500">Processing authentication...</p>
    </div>
  );
}
