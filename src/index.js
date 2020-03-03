require("./db/mongoose")

// const User=require("./models/user")
// const Tasks=require("./models/tasks")
const userRouter=require("./router/user-router")
const taskRouter=require("./router/task-router")
//loading express 
const express=require('express');
// our new express application
const app=express();
// assigning port
const port =process.env.PORT
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port,()=>{
    console.log('Server is up on PORT ' + port)
})