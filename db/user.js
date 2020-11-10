const bcrypt = require('bcrypt');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const cors = require('cors');


const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json()); // support json encoded bodies 
/*
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers","Content-Type");
    next();
});*/
const connection = mysql.createConnection({
    host: 'mysql.cinemanode.svc',
    user: 'benuch',
    password: 'palkast',
    database: 'cinemadb',
    port: 3306
});

const comparePassword = function(password, hash) {
    return bcrypt.compareSync(password, hash);
}


const register = function(req, res) {
    let userExists;
    const vals = Object.keys(req.body).map(function(key) {
        return req.body[key];
    });
    connection.query("select 1 from customers where email='" + req.body.email + "'", function(err, rows) {
        if (err) throw err
        userExists = rows[0];
        if (userExists) res.json({ success: false, msg: "User exists already" });
        else {
            vals[1] = bcrypt.hashSync(req.body.password, 10);
            connection.query("INSERT INTO customers(email,password,name,surename,telephone) VALUES(?,?,?,?,?)", vals, function(err, result) {
                if (err) res.json({ success: false, msg: "Fucked up!" });
                res.json({ success: true, msg: "Rejestracja zakończona powodzeniem!" });
            });
        }

    });

}


const customers = function(req, res) {
    connection.query("select * from customers", function(err, rows) {
        if (err) res.json(err);
        res.json(rows);
    });
}



const login = function(req, res) {
    console.log(req.body);
    connection.query("select * from customers where email='" + req.body.email + "'", function(err, rows, fields) {
        if (err) throw err
        user = rows[0];
        if (user) {
            if (!comparePassword(req.body.password, user.password)) {
                //res.status(401).json({success:false, msg: 'Authentication failed. Wrong password.' });
                res.json({ success: false, msg: " Authentication failed. Wrong password" });
            } else {
                return res.json({ success: true, msg: "Loging in success!", token: 'JWT ' + jwt.sign({ email: user.email, name: user.name, surename: user.surename, id: user.id }, 'RESTFULAPIs') });
            }
        } else {
            // res.status(401).json({ msg: 'Authentication failed. User not found.' });
            res.json({ success: false, msg: " Authentication failed. User not found" });
        }

    });
};


const memberinfo = function(req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], 'RESTFULAPIs', function(err, decode) {
            console.log("DECODE: ");
            console.log(decode);
            if (err) req.user = undefined;

            connection.query("select email from customers where email='" + decode.email + "'", function(err, rows, fields) {
                const user = rows[0];
                if (user) {
                    res.json({ success: true, msg: decode.email });
                } else {
                    res.json({ success: false, msg: "No such user registered" });
                }
            });
            req.user = decode; //?
            // next();
        });
    } else {
        res.json({ success: false, msg: "Token not provided" });
        req.user = undefined; //?
        //next();
    }
};


const loginRequired = function(req, res, next) {
    if (req.user) {
        console.log("loginRequired");
        next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user!' });
    }
};

module.exports = { mysql, register, login, loginRequired, memberinfo,customers }