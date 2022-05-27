import express from 'express';

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import router  from './routes/home';
const { verify } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const app=express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
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
app.use(express.static('./assets'));

///set up view engine
app.set('view engine','ejs');
app.set('views','./views');


//use router
app.use('/',router);


//listen to the port
app.listen(5000,()=>{
    console.log('Server runs on port 5K');
});