const nodemailer = require("nodemailer");
const email = "sarabpreets04@gmail.com";
const password = "sarab78903";


var transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
    user:email,
    pass: password
    }
});
var mailOptions= {
from:email,
to:"sarabpreets7@gmail.com",
subject: "List of items matching your budget",
text: project_1.json
}
transporter.sendMail(mailOptions,function(error,info){
if(error){
    console.log(error);
}
else{
    console.log("Email sent: "+info.response)
}
})