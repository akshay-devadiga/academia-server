const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
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


app.post('/api/courses',VerificationHelper.verifyToken,(req, res)=>{
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

app.post('/api/login',(req, res)=>{
    // Validate user with db 
    // If Yes - return back access token and set this access token in local storage in client
    // If No - Return 404
})

app.post('/api/createUser',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            // Get the user object from client
            // Get Generate access token for the user
            // Update the db with access token   
        }
    });
})

app.listen(3000)
