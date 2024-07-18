const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = 5000 || process.env.PORT;
app.use(express.json());
app.use(cors({
  origin:['http://localhost:5173','http://localhost:5174','http://localhost:5175'],
  credentials: true
}));
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dibths0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database = client.db("quick-cash");
    const userCollection = database.collection("user");

    app.post('/jwt',async(req,res)=>{
      const user =req.body
      console.log(user)
      const token = jwt.sign(user,process.env.DB_TOKEN_SECRET,{expiresIn:'1h'})
      res.cookie('token',token,cookieOptions).send({success:true})
    })


    app.post("/register", async (req, res) => {
      const user = req.body;
      // Generate a salt
      //console.log(user.password);
      const salt = await bcrypt.genSalt(10);
      // Hash the PIN with the salt
      const hashedPin = await bcrypt.hash(user.password, salt);
      //console.log(hashedPin);
      if (hashedPin) {
        const userDetails = {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          password: hashedPin,
        };
        const result = await userCollection.insertOne(userDetails);
        res.send({ result, userDetails });
      }
    });
    app.get("/login", async (req, res) => {
      console.log("user");
      const user = req.query;
      const query = {
        email: user.email,
      };
      //console.log(user,"test")

      const userData = await userCollection.findOne(query);
      if (userData !== null) {
        const isMatch = await bcrypt.compare(user.password, userData.password);
        console.log(isMatch);
        if (isMatch === false) {
          return res.send({ message: "no match" });
        } else {
          res.send(userData);
        }
      }
    });
    app.get("/login-number", async (req, res) => {
      console.log("user");
      const user = req.query;
      console.log(user);
      const query = {
        phoneNumber: user.phoneNumber,
      };

      const userData = await userCollection.findOne(query);
      console.log(userData);
      if (userData !== null) {
        const isMatch = await bcrypt.compare(user.password, userData.password);
        console.log(isMatch);
        if (isMatch === false) {
          return res.send({ message: "no match" });
        } else {
          res.send(userData);
        }
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from job task");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
