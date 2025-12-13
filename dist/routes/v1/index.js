"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./auth.route"));
const swagger_route_1 = __importDefault(require("./swagger.route"));
const user_route_1 = __importDefault(require("./user.route"));
const upload_route_1 = __importDefault(require("./upload.route"));
const eventType_route_1 = __importDefault(require("./eventType.route"));
const serviceCategory_route_1 = __importDefault(require("./serviceCategory.route"));
const subCategory_route_1 = __importDefault(require("./subCategory.route"));
const amenities_route_1 = __importDefault(require("./amenities.route"));
const listings_route_1 = __importDefault(require("./listings.route"));
const review_route_1 = __importDefault(require("./review.route"));
const config_1 = __importDefault(require("../../config/config"));
const router = express_1.default.Router();
const defaultIRoute = [
    {
        path: "/auth",
        route: auth_route_1.default,
    },
    {
        path: "/users",
        route: user_route_1.default,
    },
    {
        path: "/upload",
        route: upload_route_1.default,
    },
    {
        path: "/event-types",
        route: eventType_route_1.default,
    },
    {
        path: "/service-categories",
        route: serviceCategory_route_1.default,
    },
    {
        path: "/sub-categories",
        route: subCategory_route_1.default,
    },
    {
        path: "/amenities",
        route: amenities_route_1.default,
    },
    {
        path: "/listings",
        route: listings_route_1.default,
    },
    {
        path: "/reviews",
        route: review_route_1.default,
    },
];
const devIRoute = [
    // IRoute available only in development mode
    {
        path: "/docs",
        route: swagger_route_1.default,
    },
];
// Globally Routes
defaultIRoute.forEach((route) => {
    router.use(route.path, route.route);
});
/* istanbul ignore next */
if (config_1.default.env === "development") {
    devIRoute.forEach((route) => {
        router.use(route.path, route.route);
    });
}
exports.default = router;
