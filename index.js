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
        const appointmentCollection = client.db("Doctors_Portal").collection("appointments");

        //!-------- get all appointment
        app.get("/services", async(req, res)=>{
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get("/available", async(req, res)=>{
            const date = req.query.date;

            // step 1:  get all services
            const services = await serviceCollection.find().toArray();
      
            // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
            const query = {date: date};
            const bookings = await appointmentCollection.find(query).toArray();
      
            // step 3: for each service
            services.forEach(service=>{
              // step 4: find bookings for that service. output: [{}, {}, {}, {}]
              const serviceBookings = bookings.filter(book => book.treatmentName === service.name);
              // step 5: select slots for the service Bookings: ['', '', '', '']
              const bookedSlots = serviceBookings.map(book => book.slot);
              // step 6: select those slots that are not in bookedSlots
              const available = service.slots.filter(slot => !bookedSlots.includes(slot));
              //step 7: set available to slots to make it easier 
              service.slots = available;
            });
           
      
            res.send(services);
            
        })

        //!-------- insert an appointment
        app.post("/appointment", async(req, res)=>{
            const appointment = req.body;

            const query = {treatmentName: appointment.treatmentName, date: appointment.date, patientName:appointment.patientName};
            const exists = await appointmentCollection.findOne(query);

            if (exists) {
                return res.send({success: false, booking: "exists"});
            }
    
            const output = await appointmentCollection.insertOne(appointment);
            res.send({success: true, output});
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

