"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'billcart_secret_key_12345';
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: '30d',
    });
};
exports.generateToken = generateToken;
