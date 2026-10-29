//React
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

//Pages
import NftDetail from "./src/pages/NftDetail";

//App
import App from "./src/App";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: function NftDetailRouteComponent() {
    const { nftId } = nftDetailRoute.useParams();
    return <NftDetail nftId={nftId} />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, nftDetailRoute]);

export const router = createRouter({
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
