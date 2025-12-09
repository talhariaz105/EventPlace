"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config/config"));
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'node-express-typescript-boilerplate API documentation',
        version: '0.0.1',
        description: 'This is a node express mongoose boilerplate in typescript',
        license: {
            name: 'MIT',
            url: 'https://github.com/saisilinus/node-express-mongoose-typescript-boilerplate.git',
        },
    },
    servers: [
        {
            url: `http://localhost:${config_1.default.port}/v1`,
            description: 'Development Server',
        },
    ],
};
exports.default = swaggerDefinition;
