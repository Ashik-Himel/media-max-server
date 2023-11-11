const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@media-max-cluster.yrng6ax.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db('media-max');
    const employeeCollection = database.collection('employees');
    const teamMemberCollection = database.collection('team-members');

    app.get('/employees', async(req, res) => {
      const result = await employeeCollection.find().project({_id: 0, id: 1, name: 1, designation: 1, phone: 1, dhHouse: 1, photo: 1}).toArray();
      res.send(result);
    })
    app.get('/employees/:id', async(req, res) => {
      const filter = {id: req.params.id};
      const result = await employeeCollection.findOne(filter);
      res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB Connected !!!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Welcome to Media Max's server !!!");
})
app.listen(port, () => {
  console.log(`Server is running in http://localhost:${port} !!!`);
})

module.exports = app;