const express = require('express');
const app = express();
const bodyparser = require('body-parser')

const mongoose = require('mongoose');

const authRouter = require('../auth-service/routes/user')

const DATABASE_URI = "mongodb://iammortex07:iammortex07@ac-9itat9x-shard-00-00.48rxy4s.mongodb.net:27017,ac-9itat9x-shard-00-01.48rxy4s.mongodb.net:27017,ac-9itat9x-shard-00-02.48rxy4s.mongodb.net:27017/?ssl=true&replicaSet=atlas-gjde4q-shard-0&authSource=admin&retryWrites=true&w=majority&appName=auth-service"

mongoose.connect(DATABASE_URI);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('connected', () => {
  console.log("Mongoose connection done");
})
db.on("error", (err) => {
  console.log("Mongoose default connection fail: " + err);
})

app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));


app.use('/', authRouter);

app.get("/", (req, res) => {
  res.send("working..");
})

app.listen(4000, () => {
  console.log('app is running...', 4000);
})