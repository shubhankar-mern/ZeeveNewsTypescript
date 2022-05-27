"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const credentials = require('../config/db');
function CreateAndInsertUsers(name, age, email, profession, sex, subscription, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool(credentials);
        const newUser = yield pool.query('INSERT INTO users (name,age,email,profession,sex,subscription,password) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [name, age, email, profession, sex, subscription, password]);
        console.log(newUser);
        yield pool.end();
        return;
    });
}
function FindUser(email, num) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool(credentials);
        const findUserInfo = yield pool.query('SELECT * FROM users WHERE email=$1', [
            email,
        ]);
        if (findUserInfo.rowCount != 0) {
            console.log('external query finduser', findUserInfo);
            yield pool.end();
            const res = JSON.parse(JSON.stringify(findUserInfo.rows[0]));
            console.log('res :', res);
            console.log('db hashed password', res.password);
            if (num == 1) {
                return res.password;
            }
            else if (num == 2) {
                return res.name;
            }
            else if (num == 3) {
                return res.age;
            }
            else if (num == 4) {
                return res.email;
            }
            else if (num == 5) {
                return res.sex;
            }
            else if (num == 6) {
                return res.profession;
            }
        }
        else {
            return -1;
        }
    });
}
function FindUserSubscription(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool(credentials);
        const findUserInfo = yield pool.query('SELECT subscription FROM users WHERE email=$1', [email]);
        console.log('external query findusersubscription', findUserInfo.rows[0].subscription);
        yield pool.end();
        return findUserInfo.rows[0].subscription;
    });
}
function FindUserPassword(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool(credentials);
        const findUserPassword = yield pool.query('SELECT password FROM users WHERE email=$1', [email]);
        console.log(findUserPassword);
        yield pool.end();
        return findUserPassword;
    });
}
function UpdateUserPassword(userEmail, userPass) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool(credentials);
        const updateUserPassword = yield pool.query('UPDATE users SET password = $1 WHERE email= $2', [userPass, userEmail]);
        //console.log(updateUserPassword);
        yield pool.end();
        return;
    });
}
function UpdateUserSubscription(sublistArr, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool(credentials);
        const updateUserSubscription = yield pool.query('UPDATE users SET subscription = $1 WHERE email= $2', [sublistArr, userEmail]);
        //console.log(updateUserPassword);
        yield pool.end();
        return;
    });
}
module.exports = {
    CreateAndInsertUsers,
    FindUser,
    FindUserPassword,
    UpdateUserPassword,
    FindUserSubscription,
    UpdateUserSubscription,
};
