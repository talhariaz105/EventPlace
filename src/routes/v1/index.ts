import express, { Router } from "express";
import authRoute from "./auth.route";
import docsRoute from "./swagger.route";
import userRoute from "./user.route";
import uploadRoute from "./upload.route";
import eventTypeRoute from "./eventType.route";
import serviceCategoryRoute from "./serviceCategory.route";
import subCategoryRoute from "./subCategory.route";
import amenitiesRoute from "./amenities.route";
import listingsRoute from "./listings.route";
import reviewRoute from "./review.route";
import bookingRoute from "./booking.route";

import config from "../../config/config";

const router = express.Router();
interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },

  {
    path: "/upload",
    route: uploadRoute,
  },
  {
    path: "/event-types",
    route: eventTypeRoute,
  },
  {
    path: "/service-categories",
    route: serviceCategoryRoute,
  },
  {
    path: "/sub-categories",
    route: subCategoryRoute,
  },
  {
    path: "/amenities",
    route: amenitiesRoute,
  },
  {
    path: "/listings",
    route: listingsRoute,
  },
  {
    path: "/reviews",
    route: reviewRoute,
  },
  {
    path: "/bookings",
    route: bookingRoute,
  },
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

// Globally Routes
defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */

if (config.env === "development") {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
