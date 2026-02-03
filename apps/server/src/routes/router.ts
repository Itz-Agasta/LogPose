import { Hono } from "hono";
import { homeRouter } from "./v1/home-page";

const apiRouter = new Hono();

// Mount v1 routes
apiRouter.route("/home", homeRouter);

export { apiRouter };
