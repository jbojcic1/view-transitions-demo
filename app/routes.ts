import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("gift-cards", "routes/gift-cards.tsx"),
  route("gift-cards/:cardId", "routes/card-details.tsx"),
] satisfies RouteConfig;
