const express=require("express")
const User=require("../models/user")
const router=new express.Router
const auth=require("../middleware/auth")
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendRemoveEmail}=require('../emails/account')


router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    try{
    await user.save()
    sendWelcomeEmail(user.email,user.name)
    const token=await user.generateAuthToken()
    
    res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e.message)
    }
})

router.post('/users/login',async(req,res)=>{
    try{
        const login=await User.findByCredentials(req.body.email,req.body.password)
        const token=await login.generateAuthToken()
        res.send({login,token})
    }
    catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send('You are successfully Logged out')
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send('Logged out of all devices')
    }
    catch(e){
        res.status(500).send()
    }

})

router.get('/users/me',auth,async (req,res)=>{
    res.send(req.user)
})

router.get('/users/:id',async(req,res)=>{
    const _id= req.params.id;

    try {
        
        const byID=await User.findById({_id})
        if(!byID){
            return res.status(404).send('Unable to find/data not found')
        }

        return res.send(byID)
    }catch(e){
        res.status(500).send("Id entered is wrong")

    }
})

router.patch('/users/me',auth,async(req,res)=>{
   const updates=Object.keys(req.body)
   const allowedUpdates=['name','age','password','email']
   const validUpdate=updates.every((update)=> allowedUpdates.includes(update))


   if(!validUpdate){
       return res.status(400).send({error:"Invalid Update"})
   }

    try{

        updates.forEach((update)=> req.user[update]=req.body[update])

        await req.user.save()

        
        res.send(req.user)
}
 catch(e){
        res.status(400).send("ID is wrong")
    }

})

router.delete('/users/me',auth,async(req,res)=>{

    try{
        await req.user.remove()
        sendRemoveEmail(req.user.email,req.user.name),
    res.send(req.user)
    }
    catch(e){
    res.status(500).send("ID not found")
    }
})



// uploading files
const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('Upload jpg,jpeg,png files alone'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(404).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)

        if(!user||!user.avatar){
            throw new Error
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})


module.exports=router