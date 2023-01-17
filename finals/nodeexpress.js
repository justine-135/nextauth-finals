const express = require("express");
const app = express();
const port = process.env.port || 3000;
const mysql = require("mysql2");

// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "camera_db",
});

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ limit: "8mb", extended: false }));

const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const nodemailer = require("nodemailer");
var path = require("path");
// app.set('views', path.join(__dirname, '/yourViewDirectory'));

app.set("views", "./pages/auth");
// app.set("views", "./views");
app.set("view engine", "ejs");

// api to insert row using POST method
// return JSON
app.post("/api/camera/insert", (req, res) => {
  // create query to db
  connection.execute(
    "INSERT INTO `detected_with_blob` (start_time, end_time, image) VALUES (?, ?, ?)",
    [req.body.start_time, req.body.end_time, req.body.image],
    (err, results, fields) => {
      if (err) throw err;
      res.json({
        message: `recorded new motion.`,
        inserted_at_id: results.insertId,
      });
    }
  );
});

// api to insert row using POST method
// return JSON
app.get("/api/motion", (req, res) => {
  // create query to db
  connection.execute(
    "SELECT * FROM `detected_with_blob`",
    (err, results, fields) => {
      if (err) throw err;
      res.json(results);
    }
  );
});

app.get("/api/motion/:id", (req, res) => {
  let id = req.params.id;
  // create query to db
  connection.execute(
    "SELECT * FROM `detected_with_blob` WHERE id = ?",
    [id],
    function (err, results, fields) {
      if (err) throw err;

      if (results.length > 0) {
        res.json(results);
      } else {
        res
          .status(400)
          .json({ message: `user with an id of ${id} is not found.` });
      }
    }
  );
});

// api to show all rows
// return JSON
app.get("/api/users/index", (req, res) => {
  // create query to db
  connection.execute("SELECT * FROM `users`", function (err, results, fields) {
    if (err) throw err;
    res.json(results);
  });
});

app.post("/api/users/check", (req, res) => {
  connection.execute(
    "SELECT * FROM `users` WHERE `name` = ? OR `email` = ?",
    [req.body.userInfo.username, req.body.userInfo.email],
    function (err, results, fields) {
      if (err) throw err;
      res.json(results);
    }
  );
});

app.post("/api/users/insert", (req, res) => {
  let salt = bcrypt.genSaltSync(5);
  let hashedpwd = bcrypt.hashSync(req.body.userInfo.password, salt);
  connection.execute(
    "INSERT INTO `users` (name, email, pwd) VALUES (?, ?, ?)",
    [req.body.userInfo.username, req.body.userInfo.email, hashedpwd],
    (err, results, fields) => {
      if (err) throw err;
      res.json({
        message: `registered new user`,
        inserted_at_id: results.insertId,
      });
    }
  );
});

app.post("/api/users/login", (req, res) => {
  let hashedpwd;
  connection.execute(
    "SELECT * FROM `users` WHERE name = ? OR email = ?",
    [req.body.text, req.body.text],
    (err, results, fields) => {
      try {
        hashedpwd = results[0].pwd;
        bcrypt.compare(req.body.password, hashedpwd, function (err, pwdres) {
          if (pwdres) {
            res.json(results);
            console.log(results);
          } else {
            res.json(null);
          }
        });
      } catch (error) {
        throw error;
      }
    }
  );
});

app.post("/api/users/check_email", (req, res) => {
  connection.execute(
    "SELECT * FROM `users` WHERE `email` = ?",
    [req.body.email],
    function (err, results, fields) {
      if (err) throw err;
      res.json(results);
    }
  );
});

app.post("/api/users/reset_pass", (req, res) => {
  let id = req.body.fetchedUser.id;
  let name = req.body.fetchedUser.name;
  let email = req.body.fetchedUser.email;
  let pwd = req.body.fetchedUser.pwd;
  // storeUser(id, name, email, pwd);

  const secret = JWT_SECRET + id;
  const token = jwt.sign({ email: email, id: id }, secret, {
    expiresIn: "5m",
  });
  const link = `http://localhost:3000/api/users/reset_pass/${id}/${token}`;
  var transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "motioncpt2@outlook.com",
      pass: "cpet17finals",
    },
  });

  var mailOptions = {
    from: "motioncpt2@outlook.com",
    to: email,
    subject: "MotionCPT - Reset pasword link",
    text: link,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});

app.get("/api/users/reset_pass/:id/:token", (req, res) => {
  const { id, token } = req.params;
  const secret = JWT_SECRET + id;
  try {
    const verify = jwt.verify(token, secret);
    res.render("changepass", {
      email: verify.email,
      status: "verified",
      id: id,
    });
  } catch (error) {
    console.log(error);

    res.send("Not Verified");
  }
});

app.post("/api/users/reset_pass/:id/:token", (req, res) => {
  const { id, token } = req.params;
  const { password, cpassword } = req.body;
  console.log(password);
  const secret = JWT_SECRET + id;
  try {
    const verify = jwt.verify(token, secret);
    let salt = bcrypt.genSaltSync(5);
    let hashedpwd = bcrypt.hashSync(password, salt);
    connection.execute(
      "UPDATE `users` SET pwd = ? WHERE id = ?",
      [hashedpwd, id],
      (err, results, fields) => {
        if (err) throw err;
        console.log(results);
        res.send(
          "<script>alert('You have changed password. Closing page...');window.close();</script > "
        );
      }
    );
  } catch (error) {
    console.log(error);

    res.send("Not Verified");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
