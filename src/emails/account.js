const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENTGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'askin30597@gmail.com',
        subject:'Thanks for Joining',
        text:`Welcome to the app,${name}.Let me how you get along`
    })
}

const sendRemoveEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'askin30597@gmail.com',
        subject:'Sorry to see you Go',
        text:`Thanks ${name}, We would miss you, Would be a pleasure if we come to know more about why you want to leave us`
    })
}
module.exports={
    sendWelcomeEmail,
    sendRemoveEmail
}