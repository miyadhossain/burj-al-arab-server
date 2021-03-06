const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());

var serviceAccount = require("./configs/burjj-al-aarab-firebase-adminsdk-372bz-d7fa3d1f90.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ube8o.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const bookings = client.db("burjAlArab").collection("bookings");

  //post/create database
  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
    console.log(newBooking);
  });

  // read/get database
  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail }).toArray((err, documents) => {
              res.status(200).send(documents);
            });
          }
          console.log({ uid });
        })
        .catch((error) => {
          // Handle error
        });
    } else {
      res.status(401).send("Unauthorized access!");
    }
  });

  console.log("DB connect succfully");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
