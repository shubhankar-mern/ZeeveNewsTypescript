"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const home_1 = __importDefault(require("./routes/home"));
const { verify } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    name: 'news_bingo',
    secret: 'secretisoutfinally',
    resave: false,
    saveUninitialized: false,
    cookie: {
        //secure:true,
        httpOnly: true,
        maxAge: 20 * 60 * 1000,
    },
}));
//serve static files
app.use(express_1.default.static('./assets'));
///set up view engine
app.set('view engine', 'ejs');
app.set('views', './views');
//use router
app.use('/', home_1.default);
//listen to the port
app.listen(5000, () => {
    console.log('Server runs on port 5K');
});
