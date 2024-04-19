"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const api_1 = __importDefault(require("./api"));
const app = (0, express_1.default)();
app.use('/routes', api_1.default);
app.use(express_1.default.static('public'));
app.get('/', (req, res) => {
    res.send('Welcome Home');
});
app.get('/tcs', (req, res) => {
    res.send('HI RCSer');
});
// Handle 404 - Keep this as a last route
app.use((req, res, next) => {
    res.status(404).send('404: File Not Found');
});
app.listen(8080, () => {
    console.log('Example app listening on port 8080!');
});
