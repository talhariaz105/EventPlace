"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcceptInvitation = exports.verifyEmail = exports.sendVerificationEmail = exports.resetPassword = exports.forgotPassword = exports.refreshTokens = exports.logout = exports.login = exports.loginWithGoogle = exports.register = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const token_1 = require("../token");
const user_1 = require("../user");
const authService = __importStar(require("./auth.service"));
const email_1 = require("../email");
exports.register = (0, catchAsync_1.default)(async (req, res) => {
    const user = await user_1.userService.registerUser(req.body);
    const tokens = await token_1.tokenService.generateAuthTokens(user);
    res.status(http_status_1.default.CREATED).send({ user, tokens });
});
exports.loginWithGoogle = (0, catchAsync_1.default)(async (req, res) => {
    const user = await user_1.userService.loginWithGoogle(req.body);
    const tokens = await token_1.tokenService.generateAuthTokens(user);
    res.status(http_status_1.default.CREATED).send({ user, tokens });
});
exports.login = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await token_1.tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
});
exports.logout = (0, catchAsync_1.default)(async (req, res) => {
    await authService.logout(req.body.refreshToken);
    res.status(http_status_1.default.NO_CONTENT).send();
});
exports.refreshTokens = (0, catchAsync_1.default)(async (req, res) => {
    const userWithTokens = await authService.refreshAuth(req.body.refreshToken);
    res.send({ ...userWithTokens });
});
exports.forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    const resetPasswordToken = await token_1.tokenService.generateResetPasswordToken(req.body.email);
    await email_1.emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
    res.status(http_status_1.default.OK).send({
        message: 'Reset password email sent successfully'
    });
});
exports.resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    await authService.resetPassword(req.query['token'], req.body.password);
    res.status(http_status_1.default.OK).send({
        message: 'Password reset successfully'
    });
});
exports.sendVerificationEmail = (0, catchAsync_1.default)(async (req, res) => {
    const verifyEmailToken = await token_1.tokenService.generateVerifyEmailToken(req.user);
    await email_1.emailService.sendVerificationEmail(req.user.email, verifyEmailToken, req.user.name);
    res.status(http_status_1.default.OK).send({
        message: 'Verification email sent successfully'
    });
});
exports.verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    await authService.verifyEmail(req.query['token']);
    res.status(http_status_1.default.OK).send({
        message: 'Email verified successfully'
    });
});
exports.AcceptInvitation = (0, catchAsync_1.default)(async (req, res) => {
    const user = await authService.AcceptInvitation(req.body);
    const tokens = await token_1.tokenService.generateAuthTokens(user);
    res.status(http_status_1.default.CREATED).send({ user, tokens });
});
