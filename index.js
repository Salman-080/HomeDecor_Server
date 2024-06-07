const express= require("express");
const cors=require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= process.env.PORT || 5000;
require('dotenv').config();

const app = express();
const stripe = require("stripe")(process.env.SECRET_KEY_STRIPE);

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
    const cartCollection= client.db("HomeDecor").collection("CartsCollections")
    const userCollection= client.db("HomeDecor").collection("UsersCollections")
    const orderCollection= client.db("HomeDecor").collection("OrdersCollections")

    app.get("/allProducts", async(req,res)=>{
      const result= await productCollection.find().toArray();
      
      res.send(result);
    })

    app.get("/productDetails/:id", async(req,res)=>{
      const id=req.params.id;
      // console.log(id);
      const query={ _id : new ObjectId(id)};

      const result= await productCollection.findOne(query);
      // console.log(result);
      
      res.send(result);
    })
    app.post("/cartProduct", async(req,res)=>{
      const productDetails=req.body;
      // console.log(productDetails);

      const result= await cartCollection.insertOne(productDetails);
      // console.log(result);
      
      res.send(result);
    })

    app.post("/usersCollection", async(req,res)=>{
      const userInfo= req.body;
      console.log(userInfo);
      const query={
        userEmail: userInfo?.userEmail
      }
      const existUser= await userCollection.findOne(query);
console.log(existUser);
      if(existUser){
        res.send("User Already Exist")
        return;
      }

      const result=await userCollection.insertOne(userInfo);

      res.send(result);
    })
    app.get("/currentUserInfo/:email", async(req,res)=>{
      const email= req.params.email;
      console.log("email is",email);

      const query={
        userEmail: email
      }

      const result=await userCollection.findOne(query);
      console.log("userINfo is = ", result);

      res.send(result);
    })
    app.get("/cartProducts/:email", async(req,res)=>{
      const email= req.params.email;

      const query={
        userEmail: email
      }

      const result=await cartCollection.find(query).toArray();

      res.send(result);
    })
    app.delete("/cartDataDelete/:cartProductId", async(req,res)=>{
      const cartProductId= req.params.cartProductId;
console.log(cartProductId);
      const query={
        _id: new ObjectId(cartProductId)
      }

      const result=await cartCollection.deleteOne(query);

      res.send(result);
    })

    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;

            const amount = parseInt(price * 100);

            console.log(price, amount);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",

                payment_method_types: ["card"],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            })
    });


    app.post("/order", async(req,res)=>{
      const orderInfo=req.body;
console.log(orderInfo);
      const result= await orderCollection.insertOne(orderInfo);

      const query={
        _id:{
          $in: orderInfo.cartIds.map(cartId=> new ObjectId(cartId))
        } 
      }

      const result2= await cartCollection.deleteMany(query);
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
