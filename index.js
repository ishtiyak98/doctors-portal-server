const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();


const app = express();
const port = process.env.PORT || 5000;


//!----middle-wire
app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS}@cluster0.xado8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get("/", (req, res) => {
    res.send("<center><h1> Doctors Portal Server</h1></center>");
});


async function run(){
    try{
        await client.connect();
        const serviceCollection = client.db("Doctors_Portal").collection("services");

        app.get("/services", async(req, res)=>{
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        
    }
    finally {
        //await client.close();
      }
}

run().catch(console.dir);


app.listen(port, ()=>{
    console.log("listening from port: ", port);
})

