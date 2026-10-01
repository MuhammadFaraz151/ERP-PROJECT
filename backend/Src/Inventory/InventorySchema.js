const mongoose=require("mongoose")


const InventorySchema=mongoose.Schema({
    name:{
        type:String
    },
    category:{
        type:String,
    },
    unitCost:{
        type:Number
    },
    sellingPrice:{
        type:Number
    },
     stock:{
        type:Number,
        min: 0,
        default: 0
    },
    unit: {
        type: String,
        enum: ['pcs', 'kg', 'gram', 'liter', 'ml'],
        default: 'pcs'
    },
      GST:{
        type:Number,
    },
expiryDate: {
  type: Date,
}


},{timestamps:true})

const InventoryModel=mongoose.model("inventory",InventorySchema)
module.exports=InventoryModel
