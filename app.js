const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
var bodyParser = require('body-parser');

// configure the app to use bodyParser()

app.use(bodyParser.json());

const VerificationHelper = require('./verificationHelper')
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'acedemiatest'

});

db.connect((err)=>{
    if(err){
        throw err
    }
    console.log("mysql is connected")
});

app.get('/api',(req, res)=>{
    res.send("API Version 1.0");
})

app.post('/api/login',(req, res)=>{
    let user = req.body.user;
    let sql = `SELECT * FROM Users WHERE Name='${user.username}' AND EmailId='${user.emailId}' AND Password='${user.password}'`; 
    db.query(sql,(err,result)=>{
        if(err) throw err;
        if(result.length>0){
            res.json({accessToken:result[0].AccessToken});
        }else{
            res.sendStatus(404)
        }  
    }); 
})

app.get('/api/students',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            let page = parseInt(req.query.page);
            let limit = parseInt(req.query.limit);
            let offset = page ? (page - 1) * limit: 1;
            limit = limit ? limit : 5;

            let sql = `SELECT * FROM students LIMIT ${offset}, ${limit}`;
            db.query(sql,(err,result)=>{
                if(err) throw err;
                let response = {}
                response.result = result;
                if(limit<result.length){
                    response.next = {
                        page: page+1,
                        limit: limit
                    }
                }
                
                    if(offset>0){
                    response.prevous = {
                        page: page-1,
                        limit: limit
                    }
                }
                res.send(response);
            });     
        }
    });
})


app.get('/api/courses',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            let sql = 'SELECT * FROM courses';
            db.query(sql,(err,result)=>{
                if(err) throw err;
                res.send(result);
            });     
        }
    });
})



app.post('/api/createUser',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            let user = req.body.user;
            jwt.sign({user},'secretkey', { expiresIn: '20 days' },(err,token)=>{
                let sql = `INSERT INTO Users (Name,EmailId,Password,AccessToken) Values('${user.username}','${user.emailId}','${12345}','${token}')`; 
                db.query(sql,(err,result)=>{
                    if(err) throw err;
                    res.json({token});
                }); 
            });
        }
    });
})

app.listen(3000)
