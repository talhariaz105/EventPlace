"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleWareSocket = exports.getSocketInstance = exports.initializeSocket = void 0;
var socket_initialize_1 = require("./socket.initialize");
Object.defineProperty(exports, "initializeSocket", { enumerable: true, get: function () { return socket_initialize_1.initializeSocket; } });
Object.defineProperty(exports, "getSocketInstance", { enumerable: true, get: function () { return socket_initialize_1.getSocketInstance; } });
var socket_middleware_1 = require("./socket.middleware");
Object.defineProperty(exports, "authMiddleWareSocket", { enumerable: true, get: function () { return __importDefault(socket_middleware_1).default; } });
