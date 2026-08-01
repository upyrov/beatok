import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin", "routes/admin.tsx"),
  route("new-lobby", "routes/new-lobby.tsx"),

  layout("routes/auth/layout.tsx", [
    route("signin", "routes/auth/signin.tsx"),
    route("signup", "routes/auth/signup.tsx"),
  ]),

  layout("routes/lobbies/layout.tsx", [
    route("lobbies/:id", "routes/lobbies/lobby.tsx"),
  ]),

  route("users/:id", "routes/user.tsx"),
] satisfies RouteConfig;
