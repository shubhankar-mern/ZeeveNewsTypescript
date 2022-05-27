import { Pool } from 'pg';
const credentials = require('../config/db');

async function CreateAndInsertUsers(
  name: string,
  age: number,
  email: string,
  profession: string,
  sex: string,
  subscription: string [],
  password: string
) {
  const pool = new Pool(credentials);
  const newUser = await pool.query(
    'INSERT INTO users (name,age,email,profession,sex,subscription,password) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [name, age, email, profession, sex, subscription, password]
  );
  console.log(newUser);
  await pool.end();

  return;
}

async function FindUser(email:string, num:number) {
  const pool = new Pool(credentials);
  const findUserInfo = await pool.query('SELECT * FROM users WHERE email=$1', [
    email,
  ]);
  if (findUserInfo.rowCount != 0) {
    console.log('external query finduser', findUserInfo);

    await pool.end();
    const res = JSON.parse(JSON.stringify(findUserInfo.rows[0]));
    console.log('res :', res);
    console.log('db hashed password', res.password);
    if (num == 1) {
      return res.password;
    } else if (num == 2) {
      return res.name;
    } else if (num == 3) {
      return res.age;
    } else if (num == 4) {
      return res.email;
    } else if (num == 5) {
      return res.sex;
    } else if (num == 6) {
      return res.profession;
    }
  } else {
    return -1;
  }
}
async function FindUserSubscription(email:string) {
  const pool = new Pool(credentials);
  const findUserInfo = await pool.query(
    'SELECT subscription FROM users WHERE email=$1',
    [email]
  );
  console.log(
    'external query findusersubscription',
    findUserInfo.rows[0].subscription
  );

  await pool.end();

  return findUserInfo.rows[0].subscription;
}
async function FindUserPassword(email:string) {
  const pool = new Pool(credentials);
  const findUserPassword = await pool.query(
    'SELECT password FROM users WHERE email=$1',
    [email]
  );
  console.log(findUserPassword);
  await pool.end();

  return findUserPassword;
}
async function UpdateUserPassword(userEmail:string, userPass:string) {
  const pool = new Pool(credentials);
  const updateUserPassword = await pool.query(
    'UPDATE users SET password = $1 WHERE email= $2',
    [userPass, userEmail]
  );
  //console.log(updateUserPassword);
  await pool.end();

  return;
}
async function UpdateUserSubscription(sublistArr:string [], userEmail:string) {
  const pool = new Pool(credentials);
  const updateUserSubscription = await pool.query(
    'UPDATE users SET subscription = $1 WHERE email= $2',
    [sublistArr, userEmail]
  );
  //console.log(updateUserPassword);
  await pool.end();

  return;
}
module.exports = {
  CreateAndInsertUsers,
  FindUser,
  FindUserPassword,
  UpdateUserPassword,
  FindUserSubscription,
  UpdateUserSubscription,
};
