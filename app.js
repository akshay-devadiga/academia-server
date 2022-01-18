const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
var bodyParser = require("body-parser");
var cors = require("cors");
const domainsFromEnv = process.env.CORS_DOMAINS || "";
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || domainsFromEnv==origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))
app.use(bodyParser.json());
const {mapKeys,camelCase} = require("lodash");

function objectToCamelCase(obj) {
    return mapKeys(obj, (v, k) => camelCase(k))
}
const VerificationHelper = require("./verificationHelper");

var env = process.env.NODE_ENV || 'development';

const developmentConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "academictest2",
} 

const producttionConfig = {
  host: "us-cdbr-east-05.cleardb.net",
  user: "b57f55f82a03bb",
  password: "7349079b",
  database: "heroku_bd4dc3bc1695a92",
} 

const db = mysql.createConnection(env=='development' ? developmentConfig : producttionConfig);

db.connect((err) => {
  if (err) {
    throw err;
  }
});

app.get("/api", (req, res) => {
  res.send("API Version 1.0");
});

app.post("/api/login", (req, res) => {
  let user = req.body.user;
  let sql = `SELECT * FROM Users WHERE EmailId='${user.emailId}' AND Password='${user.password}'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.json({ accessToken: result[0].AccessToken });
    } else {
      res.sendStatus(404);
    }
  });
});

app.get("/api/students", VerificationHelper.verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = page ? (page - 1) * limit : 1;
      limit = limit ? limit : 5;

      let outerQuery = `SELECT Count(RollNo) as total FROM students`;
      db.query(outerQuery, (err, outerResult) => {
        if (err) throw err;
        let response = {};
        let total = outerResult[0].total;
        response.totalPages = Math.ceil(total/limit);
        let innerQuery = `SELECT * FROM students LIMIT ${offset}, ${limit}`;
        db.query(innerQuery, (err, result) => {
          if (err) throw err;
          response.result = result.map(objectToCamelCase)
          res.json(response);
        });
      });
    }
  });
});

app.patch("/api/students/:rollNo", VerificationHelper.verifyToken, (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      } else {
        console.log(req.params,req.body);
        let rollNo =  parseInt(req.params.rollNo);
        let outerQuery = `DELETE from StudentCourseMapping WHERE RollNo=${rollNo}`;
        db.query(outerQuery, (err, result) => {
          if (err) throw err;
          let courses = req.body.courses;
          console.log(courses,"courses");
          if (courses && courses.length > 0) {
            courses.forEach((course) => {
             console.log(course,"course");
              let innerQuery = `INSERT INTO StudentCourseMapping (CourseId, RollNo) values (${course.id}, ${rollNo})`;
              db.query(innerQuery, (err, result) => {
                if (err) throw err;
              });
            });
            res.json({ message: "Student record updated successfully" });
          } else {
            res.sendStatus(404);
          }
        });
      }
    });
  });

app.get("/api/courses", VerificationHelper.verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      let sql = "SELECT * FROM courses";
      db.query(sql, (err, result) => {
        if (err) throw err;
        result=result.map(objectToCamelCase)
        res.send(result);
      });
    }
  });
});

// Get all courses for a student
app.get(
  "/api/students/:rollNo",
  VerificationHelper.verifyToken,
  (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      } else {
        let rollNo = parseInt(req.params.rollNo);
        let outerQuery = `SELECT * FROM Students WHERE RollNo=${rollNo}`;
        db.query(outerQuery, (err, outerQueryResult) => {
          if (err) throw err;
          outerQueryResult = outerQueryResult.map(objectToCamelCase)
          let studentBasicInfo = outerQueryResult[0];
          let innerQuery = `SELECT c.id,c.Name,c.TotalHours,c.Thumbnail FROM Courses c, StudentCourseMapping scm WHERE scm.courseId=c.Id AND RollNo=${rollNo}`;
            db.query(innerQuery, (err, innerQueryResult) => {
            if (err) throw err;
            let result = {...studentBasicInfo,courses:innerQueryResult.map(objectToCamelCase)};
            res.json(result);
            });
        });
    }
    });
  }
);

// Delete course for a student
app.delete(
  "/api/students/:rollNo/course/:courseId",
  VerificationHelper.verifyToken,
  (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      } else {
        let rollNo = parseInt(req.params.rollNo);
        let courseId = parseInt(req.params.courseId);
        let sql = `DELETE FROM StudentCourseMapping WHERE RollNo=${rollNo} AND CourseId=${courseId}`;
        db.query(sql, (err, result) => {
          if (err) throw err;
          res.json({
            message: `Course with id ${courseId} for student with roll no ${rollNo} deleted successfully`,
          });
        });
      }
    });
  }
);

// Add new course/courses for a student
app.post(
  "/api/students/:rollNo/courses",
  VerificationHelper.verifyToken,
  (req, res) => {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        console.log(err);
        res.sendStatus(403);
      } else {
        let rollNo = parseInt(req.params.rollNo);
        let courses = req.body.courses;
        if (courses && courses.length > 0) {
          courses.forEach((course) => {
            let sql = `INSERT INTO StudentCourseMapping (CourseId, RollNo) values (${course.id}, ${rollNo})`;
            db.query(sql, (err, result) => {
              if (err) throw err;
            });
          });
          res.json({ message: "Courses added successfully" });
        } else {
          res.sendStatus(404);
        }
      }
    });
  }
);

app.post("/api/createUser", VerificationHelper.verifyToken, (req, res) => {
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      let user = req.body.user;
      jwt.sign(
        { user },
        "secretkey",
        { expiresIn: "20 days" },
        (err, token) => {
          let sql = `INSERT INTO Users (Name,EmailId,Password,AccessToken) Values('${
            user.username
          }','${user.emailId}','${12345}','${token}')`;
          db.query(sql, (err, result) => {
            if (err) throw err;
            res.json({ token });
          });
        }
      );
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
