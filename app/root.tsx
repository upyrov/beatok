import { HotkeysProvider } from "@tanstack/react-hotkeys";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { GlobalErrorModal } from "~/components/error-modal";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";
import type { Route } from "./+types/root";
import { userQueryOptions, useUser } from "./api/user";
import "./app.css";
import { auth } from "./lib/firebase";
import { getQueryClient } from "./lib/query-client";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Beatok | Beat Battle" },
    {
      name: "description",
      content:
        "Join the beat battle platform. Compete, vote, and rise to the top.",
    },
    { property: "og:title", content: "Beatok | Beat Battle" },
    {
      property: "og:description",
      content:
        "Join the beat battle platform. Compete, vote, and rise to the top.",
    },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { tagName: "link", rel: "canonical", href: "https://beatok.net" },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function HydrateFallback() {
  return (
    <div className="min-h-screen flex p-8">
      <div className="system-skeleton w-full h-full min-h-[80vh]" />
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Content() {
  const { data: user = null } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () =>
      queryClient.invalidateQueries({ queryKey: userQueryOptions().queryKey }),
    );
    return () => unsubscribe();
  }, [queryClient]);

  return (
    <>
      <Header user={user} />
      <GlobalErrorModal />
      <main className="flex flex-col min-h-[calc(100svh-var(--spacing-header))]">
        <Outlet context={{ user }} />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const queryClient = getQueryClient();

  return (
    <HotkeysProvider>
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    </HotkeysProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
