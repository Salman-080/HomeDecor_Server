const express= require("express");
const cors=require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const port= process.env.PORT || 5000;
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/",(req,res)=>{
    res.send("AgSpert Task server is running");
})

app.listen(port, (req,res)=>{
    console.log(`server is running on ${port}`);
})


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.pcelgh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const productCollection= client.db("HomeDecor").collection("ProductsCollections")

    app.get("/allProducts", async(req,res)=>{
      const result= await productCollection.find().toArray();
      
      res.send(result);
    })



    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
