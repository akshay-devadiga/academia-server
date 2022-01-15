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

// Get all courses for a student
app.get('/api/students/:rollNo/courses',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            let rollNo = parseInt(req.params.rollNo);
            let sql = `SELECT c.Name,c.TotalHours,c.Thumbnail FROM Courses c, StudentCourseMapping scm WHERE scm.courseId=c.Id AND RollNo=${rollNo}`;
            db.query(sql,(err,result)=>{
                if(err) throw err;
                res.json(result);
            });     
        }
    });
})

// Delete course for a student
app.delete('/api/students/:rollNo/course/:courseId',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            let rollNo = parseInt(req.params.rollNo);
            let courseId = parseInt(req.params.courseId);
            let sql = `DELETE FROM StudentCourseMapping WHERE RollNo=${rollNo} AND CourseId=${courseId}`;
            db.query(sql,(err,result)=>{
                if(err) throw err;
                res.json({message:`Course with id ${courseId} for student with roll no ${rollNo} deleted successfully`});
            });     
        }
    });
})

// Add new course/courses for a student
app.post('/api/students/:rollNo/courses',VerificationHelper.verifyToken,(req, res)=>{
    jwt.verify(req.token,'secretkey',(err,authData) =>{
        if(err){
            console.log(err)
            res.sendStatus(403)
        }else{
            let rollNo = parseInt(req.params.rollNo);
            let courses = req.body.courses;
            console.log(rollNo,courses)
            if(courses && courses.length>0){
                courses.forEach(course=>{
                    let sql = `INSERT INTO StudentCourseMapping (CourseId, RollNo) values (${course.id}, ${rollNo})`;
                    db.query(sql,(err,result)=>{
                        if(err) throw err;               
                    });
                });
                res.json({message:"Courses added successfully"});
            }else{
                res.sendStatus(404);
            }
                 
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
