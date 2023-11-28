const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


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
    const chairmanCollection = database.collection('chairman');

    // Employees' Api
    app.get('/employees', async(req, res) => {
      let filter = {};
      if (req.query.search) {
        filter = { name: { $regex: req.query.search, $options: 'i' } }
      }
      const result = await employeeCollection.find(filter).toArray();
      res.send(result);
    })
    app.post('/employees', async(req, res) => {
      const result = await employeeCollection.insertOne(req.body);
      res.send(result);
    })
    app.get('/employees/:id', async(req, res) => {
      const filter = {id: req.params.id};
      const result = await employeeCollection.findOne(filter);
      res.send(result);
    })
    app.put('/employees/:id', async(req, res) => {
      const filter = {id: req.params.id};
      const updatedDocument = {
        $set: req.body
      }
      const result = await employeeCollection.updateOne(filter, updatedDocument);
      res.send(result);
    })
    app.delete('/employees/:id', async(req, res) => {
      const filter = {id: req.params.id};
      const result = await employeeCollection.deleteOne(filter);
      res.send(result);
    })
    app.get('/employees/count', async(req, res) => {
      const result = (await employeeCollection.countDocuments()).toString();
      res.send(result);
    })
    
    // Chairman's Api
    app.get('/chairman', async(req, res) => {
      const filter = {_id: new ObjectId('65610aa021a0e77c6e5ba3e9')}
      const result = await chairmanCollection.findOne(filter);
      res.send(result);
    })
    app.put('/chairman', async(req, res) => {
      const filter = {_id: new ObjectId('65610aa021a0e77c6e5ba3e9')}
      const updatedDocument = {
        $set: req.body
      }
      const result = await chairmanCollection.updateOne(filter, updatedDocument);
      res.send(result);
    })

    // Team Members' Api
    app.get('/team', async(req, res) => {
      const result = await teamMemberCollection.find().toArray();
      res.send(result);
    })
    app.get('/team/:id', async(req, res) => {
      const filter = {_id: new ObjectId(req.params.id)}
      const result = await teamMemberCollection.findOne(filter);
      res.send(result);
    })
    app.put('/team/:id', async(req, res) => {
      const filter = {_id: new ObjectId(req.params.id)};
      const updatedDocument = {
        $set: req.body
      }
      const result = await teamMemberCollection.updateOne(filter, updatedDocument);
      res.send(result);
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Welcome to Media Max's server !!!");
})
app.listen(port)

module.exports = app;