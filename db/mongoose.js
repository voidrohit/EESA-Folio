const mongoose = require('mongoose')
require('dotenv').config()

mongoose.connect("mongodb+srv://voidrohit:Rks&18158920@cluster0.oiqtt.mongodb.net/EESAFolio?retryWrites=true&w=majority", {
    useNewUrlParser:true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
