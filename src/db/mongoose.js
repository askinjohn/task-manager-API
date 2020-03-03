const mongoose=require('mongoose')//requiring mongoose

//connecting mongoose to database
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindandModify:false
})



// const me=new Tasks({
//     description:'Read a Book',

// })

// me.save().then((me)=>{
//     console.log(me)
//     }).catch((error)=>{
//         console.log(error)
//     })