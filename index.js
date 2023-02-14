const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ho0d8c2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// 123456A!

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         res.status(401).send({ message: 'Unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1];
//     jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, function (err, decoded) {
//         if (err) {
//             res.status(401).send({ message: 'Unauthorized access' });
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run() {
    try {
        const usersCollection = client.db('productList').collection('users');

        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = await usersCollection.find(query).toArray();
            res.send(cursor);
        })


        app.post('/users', async (req, res) => {
            const hashedPass = await bcrypt.hash(req.body.password, 10);
            const user = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                password: hashedPass,
                userName: req.body.email
            };
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(error => console.error(error));

app.get('/', (req, res) => {
    res.send(' server running!')
})

app.listen(port, () => {
    console.log(` server listening on port ${port}`)
})