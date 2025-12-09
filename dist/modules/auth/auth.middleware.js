"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
    console.log('Authentication attempt:', req.headers.authorization);
    console.log('required rights', requiredRights);
    if (err || info || !user) {
        return reject(new ApiError_1.default('Please authenticate', http_status_1.default.UNAUTHORIZED));
    }
    req.user = user;
    resolve();
};
const authMiddleware = (...requiredRights) => async (req, res, next) => new Promise((resolve, reject) => {
    // console.log("Auth middleware triggered", req.headers, ".................headers");
    passport_1.default.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
})
    .then(() => next())
    .catch((err) => next(err));
exports.default = authMiddleware;
