const jwt = require('jsonwebtoken');
const adminQueryModule = require('../../model/query/adminquery');
const queryModule = require('../../model/query/query');
const { OAuth2Client } = require('google-auth-library');
const sendmail = require('../../services/mail');


module.exports = {
    /* function for Admin  sign up */
    async signup(req,res){
        let {
            body: { Data},
        } = req
        if(!Data) return res.status(412).send({ code:412, status: 'Data is required' })
        if (!Data.Email) return res.status(412).send({ code:412, status: 'Email is required' })
        if (!Data.Password) return res.status(412).send({ code:412, status: 'Password is required' })        
        if (!Data.First_Name) return res.status(412).send({ code:412, status: 'First Name is required' })
        if (!Data.Last_Name) return res.status(412).send({ code:412, status: 'Last Name is required' })
        if(!Data.Gender) return res.status(412).send({ code:412, status: 'Gender is required' })
        Email = Data.Email.toLowerCase()
        try{
            let admin = await adminQueryModule.getAdmin({Email:Email})
            if(admin) return res.status(422).send({ code:422, status: 'Email already exist' })
            Data.Login_Type = "SIGNUP";

            await adminQueryModule.saveAdmin(Data);
            return res.status(201).send({code:201,status:"Sign up successfully."})
            
        }catch(err){
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }

    },
     
    /*function for Admin login (simple login , Google-login , Facebook-login) */
    async UserLOgin(req,res){
        Login_Type = req.body.Login_Type ;

        /*Simple login */
        if(Login_Type == 'LOGIN'){

            let Email = req.body.Email;
            let Password = req.body.Password;
            if(!Email) return res.status(412).send({ code:412, status: 'Email is required' })
            if(!Password) return res.status(412).send({ code:412, status: 'Password is required' })
        
        
            try{
        
                let adminData = await adminQueryModule.getAdmin({Email:Email});
                if(!adminData) return res.status(422).send({ code:422, status: 'Sign Up First' })
                
                if(adminData.Password != Password) return res.status(422).send({ code:422, status: 'Password Incorrect' })
        
                let payload = {
                    Email: adminData.Email,
                    First_Name: adminData.First_Name,
                    Last_Name: adminData.Last_Name,
                    _id :adminData._id,
                    roles: 'Admin'
                }
                let token = jwt.sign(payload,process.env.JWT_Key, { expiresIn: "24h" })
                res.status(200).send({code:200, status:"success",token:token})
            }catch(err){
                return res.status(422).send({ code:422, status: 'Failed' , msg : err.message})
            }

            
        /* Google-Login  */
            
        }else if (Login_Type=='GOOGLE'){
            
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

            const  token   = req.body.token;
            if(!token) return res.status(404).send({code:404,status:"failed",msg:"Please provide token"})
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const data = ticket.getPayload();   
            try{
                let admin = await adminQueryModule.getAdmin({Email:data.email})
                let googleData = {
                    Email : data.email,
                    First_Name : data.given_name,
                    Last_Name: data.family_name,
                    Login_Type : 'GOOGLE',
                    roles: 'Admin'
                    }
                if(!admin){
                    let save_data = await adminQueryModule.saveAdmin(googleData); 
                    googleData._id = save_data._id;
                    let token = jwt.sign(googleData,process.env.JWT_Key, { expiresIn: "24h" })
                    return res.status(200).send({ code:200, status: 'Success',token:token })
                }
                googleData._id = admin._id;
                let token = jwt.sign(googleData,process.env.JWT_Key, { expiresIn: "24h" })
                return res.status(200).send({ code:200, status: 'Success',token:token })
            }catch(err){
                console.log(err)
                return res.status(422).send({ code:422, status: 'Failed' , msg : err.message})
            }


            /* Facebook-Login */

        }else if(Login_Type=='FACEBOOK'){
            const {userId , accessToken} = req.body;
            if(!userId) return res.status(404).send({code:404,status:"failed",msg:"Please provide User ID in facebook"})
            if(!accessToken) return res.status(404).send({code:404,status:"failed",msg:"Please provide access token in facebook"})
            try{
                let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userId}/?fields=id,name,email&access_token=${accessToken}`;
                let facebookData = await axios.get(urlGraphFacebook)
                
                let Email =  facebookData.data.email ? facebookData.data.email : req.body.Email ? req.body.Email : null
                if(!Email) return res.status(422).send({code:422,status:"Email is required."})
                
                let existingUser = await adminQueryModule.getAdmin({Fb_User_Id:userId})
                existingUser = JSON.parse(JSON.stringify(existingUser));
                if(!existingUser){
                    const NAMES = facebookData.data.name.split(" ")
                    const First_Name = NAMES[0]
                    const Second_Name = NAMES[1] ?  NAMES[1]:"" 
                    const Data = {
                        Email : req.body.Email,
                        First_Name : First_Name,
                        Last_Name: Second_Name,
                        Login_Type : 'FACEBOOK',
                        Fb_User_Id :userId,    
                    }
                    save_data =  await adminQueryModule.saveAdmin(Data);
                    Data.roles = 'Admin';
                    Data._id = save_data._id;

                    let token = jwt.sign(Data,process.env.JWT_Key, { expiresIn: "24h" })
                    return res.status(200).send({code:200,status:"suceess",token:token});
                }
                existingUser.roles = 'Admin';
                let token = jwt.sign(existingUser,process.env.JWT_Key, { expiresIn: "24h" })
                return res.status(200).send({code:200,status:"suceess",token:token});
            }catch(err){
                console.log("error in catch",err.message);
                res.status(422).send({code:422,status:"failed",msg:err.message});
                }
            }
    },

    /*function for getting all user list) */
    async getAllUserByAdmin(req,res){

        try{
            let getAllUser = await adminQueryModule.getAllUser();
            console.log("Admin having data of all user:",getAllUser.length);
            return res.status(200).send({code:200,status:"success",data:getAllUser});
            
        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:"failed",msg:err.message});
        }

    },

    /*function use to block list */
    async blockUserByAdmin(req,res){
        let userId = req.params.userId;
        let do_block = req.body.do_block;
        if(!userId) return res.status(412).send({code:412,status :"failed",msg:"Data is required"});
        if(!do_block) return res.status(412).send({code:412,status :"failed",msg:"Block Condition is required"});
        try{
            let userdetails = await queryModule.getUser({_id:userId});
            if(!userdetails) return res.status(404).send({code:404,status :"failed",msg:"User details is found"});
            let blockUser = await adminQueryModule.blockByAdmin(userId,do_block);
            console.log("blockUser By Admin:",blockUser);
            if(do_block=== true){
                let subject = "Your account has been disabled";
                let text = "Due to some reasons your account Chatgenie has been disabled. For more information please contact the admin - abc@gmail.com"
                let mail = await sendmail(userdetails.Email,subject,text);
                console.log("Mail send successfully",mail)
            }else{
                console.log("hey")
                let subject = "Your Accoun has been activated now";
                let text = "Hey! Your account is activated again .Sorry for the inconvenience. Keep using our services."
                let mail = await sendmail(userdetails.Email,subject,text);
                console.log("Mail send successfully",mail)
            }
            return res.status(200).send({code:200,status:"success",data:blockUser});
        }catch(err){
            console.log("error is :",err)
            return res.status(422).send({code:422,status:"failed",msg:err.message});
        }
    },

    /*function for reseting password */
    async resetPasswordForAdmin(req,res){
        let password = req.body.password;
        if(!password) return res.status(412).send({code:412,status:"failed",msg:"Password is required"})
        try{
            await adminQueryModule.updateAdminPassword(req.user._id,password);
            let subject = "Password Changed";
            let text = "Hey! Your account password is successfully changed. If password was changed without knowledge. Please talk to Chatgenie developer."
            let mail = await sendmail(req.user.Email,subject,text);
            return res.status(200).send({code:200,status:"success",msg:"Password Updated Successfully"})

        }catch(err){
            return res.status(422).send({code:422,status:"failed",msg:err.message});
        }
    }
}
