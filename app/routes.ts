import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [index("routes/home.tsx")]),

  layout("routes/auth/layout.tsx", [
    route("signin", "routes/auth/signin.tsx"),
    route("signup", "routes/auth/signup.tsx"),
  ]),
] satisfies RouteConfig;
