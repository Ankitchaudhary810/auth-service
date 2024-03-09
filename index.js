const express = require('express');
const app = express();
const bodyparser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors');
require('dotenv').config()
const mongoose = require('mongoose');

const authRouter = require('../auth-service/routes/user');



mongoose.connect(process.env.DATABASE_URL);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('connected', () => {
  console.log("Mongoose connection done");
})
db.on("error", (err) => {
  console.log("Mongoose default connection fail: " + err);
})

app.use(
  cors({
    origin: process.env.CLIENT_ROOT_URI,
    credentials: true
  })
)

app.use(express.json());
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: false }));


app.use('/', authRouter);

app.get("/", (req, res) => {
  res.send("working..");
})

app.listen(4000, () => {
  console.log('app is running...', 4000);
})