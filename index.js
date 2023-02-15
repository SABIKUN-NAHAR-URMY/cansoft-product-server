const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ho0d8c2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// 123456A!(urmy)
// 123456S@S(sucu)

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
        const productsCollection = client.db('productList').collection('products');

        app.get('/users', async (req, res) => {
            const query = {};
            const cursor = await usersCollection.find(query).toArray();
            res.send(cursor);
        })

        app.post('/login', async (req, res) =>{
            const query = {
                email: req.body.email
            }
            const userInfo = await usersCollection.find(query).toArray();
            console.log(userInfo);
            if(userInfo.length === 0){
                return res.send({acknowledged: false});
            }
            else{
                const pass = await bcrypt.compare(req.body.password, userInfo[0].password);
                console.log(pass);
                if(pass === true && req.body.email){
                    return res.send({acknowledged: true, userInfo: userInfo})
                }
                else {
                    return res.send({acknowledged: false})
                }
            }
        })

        app.post('/forgot', async (req, res) => {
            const query = {
                email: req.body.email
            }
            const userEmail = await usersCollection.find(query).toArray();
            console.log(userEmail);
            if(userEmail.length === 0){
                return res.send({acknowledged: false});
            }
            else {
                return res.send({acknowledged: true, userEmail: userEmail});
            }

            })


            app.patch('/resetPass/:id', async (req, res) => {
                const id = req.params.id;
                const password = req.body.password;
                const hashedPass = await bcrypt.hash(password, 10);
                const query = { _id : new ObjectId(id)}
                // const userQuery = await usersCollection.find(query).toArray();
                // const pass = await bcrypt.compare(password, userQuery[0].password);
                // console.log(pass);
                const updateDoc = {
                    $set: {
                        password: hashedPass
                    }
                }
                const result = await usersCollection.updateOne(query, updateDoc);
                res.send(result);
    
            })


        app.post('/signup', async (req, res) => {
            const hashedPass = await bcrypt.hash(req.body.password, 10);
            const query = {
                email: req.body.email,  
            }
            const alreadyRegister = await usersCollection.find(query).toArray();
            if (alreadyRegister.length) {
                return res.send({ acknowledged: false });
            }
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

        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = await productsCollection.find(query).toArray();
            res.send(cursor);
        })

        app.get('/editProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        app.patch('/editProduct/:id', async (req, res) => {
            const id = req.params.id;
            const title = req.body.title;
            const price = req.body.price;
            const rating = req.body.rating;
            const stock = req.body.stock;
            const query = { _id : new ObjectId(id)}
            const updateDoc = {
                $set: {
                    title: title,
                    price: price,
                    rating: rating,
                    stock: stock
                }
            }
            const result = await productsCollection.updateOne(query, updateDoc);
            res.send(result);

        })

        app.get('/editUserProfile/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        app.patch('/editUserProfile/:id', async (req, res) => {
            const id = req.params.id;
            const firstName = req.body.firstName;
            const lastName = req.body.lastName;
            const phone = req.body.phone;
            const query = { _id : new ObjectId(id)}
            const updateDoc = {
                $set: {
                    firstName: firstName,
                    lastName: lastName,
                    phone: phone
                }
            }
            const result = await usersCollection.updateOne(query, updateDoc);
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