const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


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
    app.post('/employees', upload.single('photo'), async(req, res) => {
      const { id, name, designation, dhHouse, phone, status, birthDate, joiningDate, bloodGroup } = req.body;
      const photo = 'https://server.mediamax.com.bd/uploads/' + req.file.filename;

      const employee = {id, name, photo, designation, dhHouse, phone, status, birthDate, joiningDate, bloodGroup};
      const result = await employeeCollection.insertOne(employee);
      res.send(result);
    })
    app.get('/employees/:id', async(req, res) => {
      const filter = {id: req.params.id};
      const result = await employeeCollection.findOne(filter);
      res.send(result);
    })
    app.put('/employees/:id', upload.single('photo'), async(req, res) => {
      const { id, name, designation, dhHouse, phone, status, birthDate, joiningDate, bloodGroup } = req.body;
      let employee = {id, name, designation, dhHouse, phone, status, birthDate, joiningDate, bloodGroup};
      if (req.file?.filename) {
        const photo = 'https://server.mediamax.com.bd/uploads/' + req.file.filename;
        employee = {id, name, photo, designation, dhHouse, phone, status, birthDate, joiningDate, bloodGroup};
      }

      const filter = {id: req.params.id};
      const updatedDocument = {
        $set: employee
      }
      const result = await employeeCollection.updateOne(filter, updatedDocument);
      res.send(result);
    })
    app.delete('/employees/:id', async(req, res) => {
      const filter = {id: req.params.id};
      const result = await employeeCollection.deleteOne(filter);
      res.send(result);
    })
    app.get('/employeeCount', async(req, res) => {
      const result = (await employeeCollection.countDocuments()).toString();
      res.send(result);
    })
    
    // Chairman's Api
    app.get('/chairman', async(req, res) => {
      const filter = {_id: new ObjectId('65610aa021a0e77c6e5ba3e9')}
      const result = await chairmanCollection.findOne(filter);
      res.send(result);
    })
    app.put('/chairman', upload.single('photo'), async(req, res) => {
      const {name, designation, about, achievements} = req.body;

      let chairman = {name, designation, about, achievements}
      if (req.file?.filename) {
        const photo = 'https://server.mediamax.com.bd/uploads/' + req.file.filename;
        chairman = {name, photo, designation, about, achievements};
      }

      const filter = {_id: new ObjectId('65610aa021a0e77c6e5ba3e9')}
      const updatedDocument = {
        $set: chairman
      }
      const result = await chairmanCollection.updateOne(filter, updatedDocument);
      res.send(result);
    })

    // Team Members' Api
    app.get('/team', async(req, res) => {
      const result = await teamMemberCollection.find().toArray();
      res.send(result);
    })
    app.post('/team', upload.single('photo'), async(req, res) => {
      const {name, designation, contact} = req.body;
      const facebook = contact.facebook, email = contact.email, whatsapp = contact.whatsapp, phone = contact.phone;
      const photo = 'https://server.mediamax.com.bd/uploads/' + req.file.filename;
      let member = {name, photo, designation, contact: {
        facebook, email, whatsapp, phone
      }}
      const result = await teamMemberCollection.insertOne(member);
      res.send(result);
    })
    app.get('/team/:id', async(req, res) => {
      const filter = {_id: new ObjectId(req.params.id)}
      const result = await teamMemberCollection.findOne(filter);
      res.send(result);
    })
    app.put('/team/:id', upload.single('photo'), async(req, res) => {
      const {name, designation, contact} = req.body;
      const facebook = contact.facebook, email = contact.email, whatsapp = contact.whatsapp, phone = contact.phone;

      let member = {name, designation, contact: {
        facebook, email, whatsapp, phone
      }}
      if (req.file?.filename) {
        const photo = 'https://server.mediamax.com.bd/uploads/' + req.file.filename;
        member = {name, photo, designation, contact: {
          facebook, email, whatsapp, phone
        }}
      }

      const filter = {_id: new ObjectId(req.params.id)};
      const updatedDocument = {
        $set: member
      }
      const result = await teamMemberCollection.updateOne(filter, updatedDocument);
      res.send(result);
    })
    app.delete('/team/:id', async(req,res) => {
      const filter = {_id: new ObjectId(req.params.id)};
      const result = await teamMemberCollection.deleteOne(filter);
      res.send(result);
    })
    app.get('/teamCount', async(req, res) => {
      const result = (await teamMemberCollection.countDocuments()).toString();
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