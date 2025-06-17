"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dynamically load the correct .env file based on NODE_ENV
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const env = process.env.NODE_ENV || 'development';
let envFile = '.env';
if (env === 'test') {
    if (fs_1.default.existsSync(path_1.default.resolve(process.cwd(), '.env.test'))) {
        envFile = '.env.test';
    }
}
else if (env === 'development') {
    if (fs_1.default.existsSync(path_1.default.resolve(process.cwd(), '.env.developpement'))) {
        envFile = '.env.developpement';
    }
}
// else: default to .env (for production or fallback)
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
exports.default = envFile;
