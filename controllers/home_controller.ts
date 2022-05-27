import { NextFunction, Request, Response } from "express";
import session from 'express-session';
const axios = require('axios');
const bcrypt = require('bcrypt');
const { verify } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const {
  CreateAndInsertUsers,
  FindUser,
  FindUserPassword,
  UpdateUserPassword,
  FindUserSubscription,
  UpdateUserSubscription,
} = require('../model/query');

declare module 'express-session'{
  interface SessionData {
    email: any;
  }
}
//homepage controller
module.exports.home = function (req:Request, res:Response) {
    return res.render('home', {
      title: 'Homepage',
    });
  };
//forgot password
module.exports.forgotPassword = function (req:Request, res:Response) {
    return res.render('forgot_pwd', {
      title: 'forgotPassword',
    });
  };
  //homepage
  module.exports.homepage = function (req:Request, res:Response) {
    res.redirect('/profile');
  };
  //register page
  module.exports.register = function (req:Request, res:Response) {
    return res.render('register', {
      title: 'Registerpage',
    });
  };
  //login page
  module.exports.login = function (req:Request, res:Response) {
    return res.render('login', {
      title: 'Loginpage',
    });
  };
  //logout
module.exports.destroySession = function (req:Request, res:Response) {
    res.clearCookie('news_bingo');
    res.clearCookie('access_token');
   
    return res.redirect('/');
  };
  //sign-in user creation or Register
module.exports.create = async function (req:Request, res:Response) :Promise<void> {
  if (req.body.password != req.body.confirm_password) {
    return res.redirect('back');
  }
  try {
    const body = req.body;
    console.log(body);
    const { name, age, email, profession, sex, subscription, password } =
      req.body;
    //bcrypt password operation

    bcrypt.hash(password, saltRounds, async function (err:any, hash:any) {
      // Store hash in your password DB.
      if (err) {
        console.log(err.message);
      } else {
        console.log('password-bcrypt-hash :', hash);
        const hashedPassword = hash;
        //inserting user into db
        console.log('password-bcrypt-hashedPass :', hashedPassword);
        // const newUser = await pool.query(
        //   'INSERT INTO users (name,age,email,profession,sex,subscription,password) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        //   [name, age, email, profession, sex, subscription, hashedPassword]
        // );
        CreateAndInsertUsers(
          name,
          age,
          email,
          profession,
          sex,
          subscription,
          hashedPassword
        );

        ///
      }
    });
    //
   
    return res.redirect('/login');
  } catch (error:any) {
    console.log(error.message);
  }
};
//login
module.exports.signIn = async function (req:Request, res:Response) {
  try {
    const body = req.body;
    console.log(body);
    //const { userEmail, userPwd } = req.body;
    const userEmail = req.body.email;
    const userPwd = req.body.password;

    // const findUser = await pool.query('SELECT * FROM users WHERE email=$1', [
    //   userEmail,
    // ]);

    const findUser = await FindUser(userEmail, 1);
    const findUserName = await FindUser(userEmail, 2);
    const findUserProfession = await FindUser(userEmail, 6);
    if (findUser != -1) {
      console.log('finduser in database', findUser);
      // const findpwd = await pool.query(
      //   'SELECT password FROM users WHERE email=$1',
      //   [userEmail]
      // );
      //const findpwd = FindUserPassword(userEmail);
      const myHashedDBpassword = findUser;
      //console.log(req.session);
      req.session.email = userEmail;
      console.log('this is session data boyos: ', req.session);
      console.log('this is session data boyos ID: ', req.sessionID);
      console.log('this is session data boyos .id : ', req.session.id);
      console.log('this is cookie : ', req.cookies);
      // console.log('userPwd', userPwd);
      // console.log('findPwd', findpwd.rows[0].password);
      // console.log('findUser', findUser.rows[0].password);
      //implementing jwt
      const token = jwt.sign(
        { user: findUserName, profession: findUserProfession },
        'secretkey',
        {
          expiresIn: '7d',
        }
      );
      console.log('jwt token', token);
      res.cookie('access_token', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      //jwt ends
      console.log('hashedpass: ', myHashedDBpassword);
      console.log('user', userPwd);
      if (findUser) {
        // bcrupt compare

        bcrypt.compare(userPwd, myHashedDBpassword, function (err:any, result:any) {
          // result == true
          if (err) {
            console.log(err.message);
          } else if (result == true) {
            
            return res.redirect('/profile');
          } else {
            
            return res.redirect('/login');
          }
        });

        //
      } else {
        
        return res.redirect('/login');
      }
    } else {
      
      return res.redirect('/register');
    }
  } catch (error:any) {
    console.log(error.message);
  }
};

//authorization

module.exports.authorization = function (req:Request, res:Response, next:NextFunction) {
  const token = req.cookies.access_token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const data = jwt.verify(token, 'secretkey');
    console.log('data is here: ', data);
    return next();
  } catch (error) {
    return res.redirect('/login');
  }
};
//settings
module.exports.settings = async function (req:Request, res:Response) {
  const email = req.session.email;
  const findUserSubs = await FindUserSubscription(email);
  const findAge = await FindUser(email, 3);
  const findEmail = await FindUser(email, 4);
  const findProfession = await FindUser(email, 6);
  const findSex = await FindUser(email, 5);
  const findUserName = await FindUser(email, 2);
  console.log(findUserSubs);
  //flash message
  
  //
  return res.render('settings', {
    title: 'Settings-Page',
    subsList: findUserSubs,
    findAge,
    findEmail,
    findProfession,
    findSex,
    findUserName,
  });
};
//edit-subscription
module.exports.editSubscription = async function (req:Request, res:Response) {
  const email = req.session.email;
  const findUserSubs = await FindUserSubscription(email);
  const findAge = await FindUser(email, 3);
  const findEmail = await FindUser(email, 4);
  const findProfession = await FindUser(email, 6);
  const findSex = await FindUser(email, 5);
  const findUserName = await FindUser(email, 2);

  return res.render('editSubscription', {
    title: 'edit-Subs',
    subsList: findUserSubs,
    findAge,
    findEmail,
    findProfession,
    findSex,
    findUserName,
  });
};
//update subscription
module.exports.updateSubscription = async function (req:Request, res:Response) {
  console.log(req.body);
  const sublist = req.body.subscription;
  const email = req.session.email;
  console.log('update-email', email);
  console.log('update-sublist: ', sublist);
  const abc = await UpdateUserSubscription(sublist, email);
  res.redirect('/settings');
};
//password updation
module.exports.updatePassword = async function (req:Request, res:Response) {
  if (req.body.password != req.body.confirm_password) {
    return res.redirect('back');
  }
  try {
    const body = req.body;
    //  console.log(body);
    const userPass = req.body.password;
    const userEmail = req.body.email;
    //  console.log('useremail', userEmail);
    //  console.log('userPass', userPass);
    //queries for password updation
    //
    bcrypt.hash(userPass, saltRounds, async function (err:any, hash:any) {
      // Store hash in your password DB.
      if (err) {
        console.log(err.message);
      } else {
        console.log('password-bcrypt-hash :', hash);
        const hashedPassword = hash;
        //inserting user into db
        console.log('password-bcrypt-hashedPass :', hashedPassword);
        // const newUser = await pool.query(
        //   'INSERT INTO users (name,age,email,profession,sex,subscription,password) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        //   [name, age, email, profession, sex, subscription, hashedPassword]
        // );
        UpdateUserPassword(userEmail, hashedPassword);
        ///
      }
    });
    //
    UpdateUserPassword(userEmail, userPass);
    //  console.log(updatepass);
    return res.redirect('/login');
  } catch (error:any) {
    console.log(error.message);
  }
};
//profile page
module.exports.profile = async function (req:Request, res:Response) {
  if (req.cookies.access_token) {
    console.log(req.cookies.news_bingo);
    console.log('this is from profile access token', req.cookies.access_token);
    console.log(req.session.email);
    const email = req.session.email;
    //flash message
    
    //
    //getting the subscriptions
    // const findUser = await pool.query('SELECT * FROM users WHERE email=$1', [
    //   email,
    // ]);
    const findUser = await FindUserSubscription(email);
    const findUsername = await FindUser(email, 2);
    console.log('findUsername', findUsername);
    const subsList = findUser;
    const subsLength = findUser.length;
    console.log('finduser :', findUser);
    console.log('sublist :', subsList);
    console.log('subslength: ', subsLength);
    // console.log(findUser.rows[0].subscription);
    // console.log(findUser.rows[0].subscription.length);
    // console.log(findUser.rows[0].subscription[0]);
    // console.log(findUser.rows[0].subscription[1]);
    // console.log(findUser.rows[0].subscription[2]);
    //get the news//busineess,headlines sports technology

    try {
      const newsData = [];
      for (var i = 0; i < findUser.length; i++) {
        if (findUser[i] == 'Business') {
          const newsBusinessAPI = await axios.get(
            'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=ca73a18f0fee4491a7cb22b9979cb8fa'
          );
          newsData.push(newsBusinessAPI);
        } else if (findUser[i] == 'Headlines') {
          const newsHeadlinesAPI = await axios.get(
            'https://newsapi.org/v2/top-headlines?country=us&apiKey=ca73a18f0fee4491a7cb22b9979cb8fa'
          );
          newsData.push(newsHeadlinesAPI);
        } else if (findUser[i] == 'Sports') {
          const newsSportsAPI = await axios.get(
            'https://newsapi.org/v2/top-headlines?country=us&category=sports&apiKey=ca73a18f0fee4491a7cb22b9979cb8fa'
          );
          newsData.push(newsSportsAPI);
        } else {
          const newsTechnologyAPI = await axios.get(
            'https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=ca73a18f0fee4491a7cb22b9979cb8fa'
          );
          newsData.push(newsTechnologyAPI);
        }
      }

      //console.log('business', newsBusinessAPI.data.articles);
      //console.log('sports', newsSportsAPI.data.articles);
      //console.log('headlines', newsHeadlinesAPI.data.articles);
      //console.log('technology', newsTechnologyAPI.data.articles);

      // console.log('data from news array', newsData);
      // console.log('data from news array 1', newsData[0].data.articles);
      // console.log('data from news array 1', newsData[1].data.articles);
      // console.log('data from news array 1', newsData[2].data.articles);

      return res.render('profile', {
        articles: newsData,
        total: subsLength,
        fields: subsList,
        registeredEmail: email,
        username: findUsername,
        
      });
    } catch (error:any) {
      console.log(error.message);
    }
  } else {
    return res.redirect('/login');
  }
};