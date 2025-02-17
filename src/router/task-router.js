const express=require("express");
const Tasks=require("../models/tasks")
const auth=require('../middleware/auth')
const router=new express.Router()

router.post('/tasks',auth,async(req,res)=>{
    const tasks=new Tasks({
        ...req.body,
        owner:req.user._id
    })

    try{
         await tasks.save()
        res.status(201).send(tasks)
    }
    catch(e){
        res.status(400).send(e)
    }

})

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks',auth,async(req,res)=>{

   const match= {}
   const sort={}

   if(req.query.completed){
       match.completed=req.query.completed==='true'
   }

   if(req.query.sortBy){
       const parts = req.query.sortBy.split(':')
       sort[parts[0]]=parts[1] === 'desc' ? -1 : 1 
   }

    try{
    await req.user.populate(
        {
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }
    ).execPopulate()
        res.send(req.user.tasks)
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.get("/tasks/:id",auth,async(req,res)=>{
   const _id= req.params.id
   
   try{
    const USERbyID=await Tasks.findOne({_id,owner:req.user._id})
       if(!USERbyID){
           return res.status(404).send('No tasks found')
       }
       res.send(USERbyID)
    }
    catch(e){
        res.status(404).send("ID not found")
    }
 })

 router.patch('/tasks/:id',auth,async(req,res)=>{
    const updateRequested=Object.keys(req.body)
    const allowedUpdates=['description','completed']
    const validUpdate=updateRequested.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if (!validUpdate){
       return res.status(400).send("Invalid update request")

    }
    try{
        const task= await Tasks.findOne({_id:req.params.id,owner:req.user._id})
        

        if(!task){
            return res.status(404).send("error")
        }

        updateRequested.forEach((update)=>{
            task[update]=req.body[update]  
        })
        
        await task.save()
        res.send(task);
    }
    catch(e){
        res.status(400).send("Id entered is wrong");
    }

 })


 router.delete('/tasks/:id',auth,async(req,res)=>{

    try{
        const task=await Tasks.findOneAndDelete({_id:req.params.id,owner:req.user.id})
        if(!task){
           return  res.status(404).send("No such tasks found")
        }
        return res.send(task)
    }
        catch(e){
            return res.status(500).send("ID not found")
        }

 })





module.exports=router