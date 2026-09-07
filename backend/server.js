const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
require("dotenv").config()

const port=process.env.PORT
const URL=process.env.MONGO_URL

const app=express()
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// products
const inventory=require("./Src/Inventory/Inventory")
const allInventory=require("./Src/Inventory/fullinventory")
const DelInventory=require("./Src/Inventory/delInventoryItem")
const updateItem=require("./Src/Inventory/updateItem")
const updateStock=require("./Src/Inventory/updateStock")

// customers
const customers=require("./Src/Customer.jsx/allCustomers")
const addCustomer=require("./Src/Customer.jsx/addCustomer")
const delCustomer=require("./Src/Customer.jsx/deleteCustomer")
const updateCustomer=require("./Src/Customer.jsx/updateCustomer")

// categories
const categoryRoutes=require("./Src/Category/categoryRoutes")

// invoice
const invoice=require("./Src/Invoice/Invoice")
const getInvoice=require("./Src/Invoice/getInvoices")
const payRemaining=require("./Src/Invoice/payRemaining")

// refund
const refund=require("./Src/Refund/refund")

// auth
const auth=require("./Src/Auth/auth")


// products
app.use("/",inventory)
app.use("/",allInventory)
app.use("/",DelInventory)
app.use("/",updateItem)
app.use("/",updateStock)
// customers
app.use("/",customers)
app.use("/",addCustomer)
app.use("/",delCustomer)
app.use("/",updateCustomer)
// categories
app.use("/",categoryRoutes)
// invoice
app.use("/",invoice)
app.use("/",getInvoice)
app.use("/",payRemaining)
// refund
app.use("/",refund)
// auth
app.use("/",auth)



app.listen(port,()=>{
    console.log(`server listning on port ${port}` )
})


async function DB(URL) {
    try {
        await mongoose.connect(URL)
        console.log("Connected to DB")
    } catch (error) {
        console.log("failed to connect")
    }
}

DB(URL)