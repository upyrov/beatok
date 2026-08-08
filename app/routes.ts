import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin", "routes/admin.tsx"),

  layout("routes/auth/layout.tsx", [
    route("signin", "routes/auth/signin.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("password-reset", "routes/auth/password-reset.tsx"),
    route("action", "routes/auth/action.tsx"),
  ]),

  route("lobbies/new", "routes/lobbies/new.tsx"),
  layout("routes/lobbies/layout.tsx", [
    route("lobbies/:id", "routes/lobbies/lobby.tsx"),
  ]),

  route("users/:id", "routes/user.tsx"),

  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("robots.txt", "routes/robots.txt.ts"),
] satisfies RouteConfig;
