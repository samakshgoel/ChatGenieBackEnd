const queryModule = require('../../model/query/query');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const { OAuth2Client } = require('google-auth-library')
const fs = require('fs');
const sendmail = require('../../services/mail');

module.exports = {

    /* function for user  sign up */
    async signup(req,res){
        // return console.log(req.body)
        let {
			body: { Data},
		} = req
        if(!Data) return res.status(422).send({ code:422, status: 'Data is required' })
		if (!Data.Email) return res.status(422).send({ code:422, status: 'Email is required' })
		if (!Data.Password) return res.status(422).send({ code:422, status: 'Password is required' })        
        if (!Data.First_Name) return res.status(422).send({ code:422, status: 'First Name is required' })
        if (!Data.Last_Name) return res.status(422).send({ code:422, status: 'Last Name is required' })
        if(!Data.Gender) return res.status(422).send({ code:422, status: 'Gender is required' })
        Email = Data.Email.toLowerCase()

        try{
            let user = await queryModule.getUser({Email:Email})
            if(user) return res.status(422).send({ code:422, status: 'Email already exist' })
            Data.Login_Type = "SIGNUP";

            let UserData = await queryModule.saveUser(Data);
            return res.status(200).send({code:200,status:"Sign up successfully."})
            
        }catch(err){
            return res.status(422).send({ code:422, status: 'Failed', msg : err.message });
        }

    },

    /*function for checking user already exist or not*/
    async userAlreadyExist(req,res){
        let Email = req.body.Email;
        if(!Email) return res.status(422).send({ code:422, status: 'Email is required' })
        Email = Email.toLowerCase();

        try{
            let user = await queryModule.getUser({Email:Email})
            if(user) return res.status(200).send({ code:200, status: 'success', data:user })
            else {
                return res.send([])
            }
        }catch(err){
            return res.status(422).send({ code:422, status: 'failed' })   
        }
    },

    /*function for getting  user self details after login*/
    async getUserSelfDetails(req,res){       
        try{
            let user = await queryModule.getUser({Email:req.user.Email},{ProfileImage:0})
            if(!user) return res.status(422).send({ code:422, status: 'User does not exist' })
            return res.status(200).send({ code:200, status: 'success', data:user })
        }catch(err){
            return res.status(422).send({ code:422, status: 'Failure', message: err.message })
           }
    },

    /*function for login (simple login , Google-login , Facebook-login) */
    async UserLOgin(req,res){
        Login_Type = req.body.Login_Type ;

        /*Simple login */
        if(Login_Type == 'LOGIN'){

            let Email = req.body.Email;
            let Password = req.body.Password;
            if(!Email) return res.status(422).send({ code:422, status: 'Email is required' })
            if(!Password) return res.status(422).send({ code:422, status: 'Password is required' })
        
        
            try{
        
                let UserData = await queryModule.getUser({Email:Email});
                if(!UserData) return res.status(422).send({ code:422, status: 'Sign Up First' })
                
                if(UserData.Password != Password) return res.status(422).send({ code:422, status: 'Password Incorrect' })
        
                let payload = {
                    Email: UserData.Email,
                    First_Name: UserData.First_Name,
                    Last_Name: UserData.Last_Name,
                    _id :UserData._id,
                    roles: 'User'
                }
                let token = jwt.sign(payload,process.env.JWT_Key, { expiresIn: "24h" })
                // console.log("tokennnn",token)
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
                let user = await queryModule.getUser({Email:data.email})
                let googleData = {
                    Email : data.email,
                    First_Name : data.given_name,
                    Last_Name: data.family_name,
                    Login_Type : 'GOOGLE',
                    roles: 'User'
                    }
                if(!user){
                    let save_data = await queryModule.saveUser(googleData); 
                    googleData._id = save_data._id;
                    let token = jwt.sign(googleData,process.env.JWT_Key, { expiresIn: "24h" })
                    return res.status(200).send({ code:200, status: 'Success',token:token })
                    }
                googleData._id = user._id;
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
                
                let existingUser = await queryModule.getUser({Fb_User_Id:userId})
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
                    save_data =  await queryModule.saveUser(Data);
                    Data.roles = 'User';
                    Data._id = save_data._id;

                    let token = jwt.sign(Data,process.env.JWT_Key, { expiresIn: "24h" })
                    return res.status(200).send({code:200,status:"suceess",token:token});
                }
                existingUser.roles = 'User';
                let token = jwt.sign(existingUser,process.env.JWT_Key, { expiresIn: "24h" })
                return res.status(200).send({code:200,status:"suceess",token:token});
            }catch(err){
                console.log("error in catch",err.message);
                res.status(422).send({code:422,status:"failed",msg:err.message});
                }
            }
    },

    /*function for getting  all user that are exist in database or signed up*/
    async getAllUser(req,res){   
        try{
            req.body._id = req.user._id

            let list = await queryModule.getUserByName(req.body);
            list = JSON.parse(JSON.stringify(list))
            let arr = []

            for(let i = 0 ; i<list.length ; i++){
                let room = await queryModule.findRoomInAllUser(req.body._id,list[i]._id);
                // console.log("roooooom ",room)
                if(room){
                    if(req.user._id==room.Sender_Id && room.Status == "Requested"){
                        list[i].Status = "Pending"
                        arr.push(list[i])
                    }else if(room.Status == "Block"){
                        list[i].Status = room.Status
                        // arr.push(list[i])

                    }else{
                        list[i].Status = room.Status
                        arr.push(list[i])   
                    }   
                }else{
                    list[i].Status = "Add"
                    arr.push(list[i])
                }
            }
        return res.status(200).send({code:200,status:'successs',data:arr,skip:req.body.skip})    
        }catch(err){
            console.log("error:::",err)
            return res.status(422).send({code:422,status:'failed',data:err})
        }
    },

    /* Function for upload profile image */
    async uploadProfileImage(req,res){
        const id = req.params.id;
        let userData = await queryModule.getUser({_id:id})
        userData = JSON.parse(JSON.stringify(userData))
        
        if(userData.ProfileImage){
            fs.unlink(userData.ProfileImage, function(err){
                if(err) return res.send({code:422,status:"failed",msg : err.message})
            })
        }
            await queryModule.uploadImage(id,req.file.path)
            return res.status(200).send({code:200,status:'successs'})
        
    },

    /* Function for get profile Image */
    async getprofileImage(req,res){
        const id = req.params.id;
        try{
            let userData = await queryModule.getUser({_id:id})
            userData = JSON.parse(JSON.stringify(userData))
            if(userData.ProfileImage){
                let myImagePath = userData.ProfileImage;
                let buff = fs.readFileSync(myImagePath);
                let base64data = buff.toString('base64');
    
                return res.status(200).send({code:200,status:'successs',data:base64data})
            }else{
                return res.status(200).send({code:200,status:'successs',data:''})
            }
        }catch(err){
            console.log(err)
            return res.status(422).send({code:422,status:"failed",msg :err.message});
        }
    },


    /* Function for update Sef Details */
    async updateSelfDetails(req,res){
        let data = req.body;
        console.log("DATA",req.body);
        if(req.body.Email || req.body.Password || req.body.Gender) return res.status(422).send({code:422,status:"failed",msg:"Cannot change Email and password here"})
        try{
            // req.body.__id = req.user._id;
            await queryModule.updateUserDetails(req.user._id,req.body)
            return res.status(200).send({code:200,status:'successs'})
        }catch(err){
            console.log(err);
            return res.status(422).send({code:422,status:"failed",msg :err.message})
        }
    },

    /* Function for forget Password */
    async forgetPassword(req,res){
        console.log('req.body is here', req.body);
        let Email = req.body.Email;
        if(!Email) return res.status(422).send({code:422,status:"failed",msg:"Email is required"})
        try{
            let Data = await queryModule.getUser({Email:Email})
            if(!Data) return res.status(404).send({code:404,status:"Failed",msg:"Email not exist in database"})
            const payload = {
                Email:Email,
                id:Data._id
            }
            const token = jwt.sign(payload,process.env.JWT_Key);
            const subject="Verification for reset the password";
            const text= `Please click on the below link for reset your password.\n link: http://localhost:3000/auth/changePassword/${token}`
            let mail = await sendmail(Email,subject,text)
            return res.status(200).send({code:200,status:"success",msg:"mail sent successfully."})
        }catch(err){
            console.log("catch error:",err.message);
            return res.status(422).send({code:422,status:"failed",msg:err.message});
        }


    },

    /* Function for reseting the password */
    async resetPassword(req,res){
        let token = req.headers.authorization;
        let password = req.body.Password; 
    
        if (!password) return res.status(401).send({code:401,status:"failed",msg:"Password is required."})
        if(!token) return res.status(401).send({code:401,status:"failed",msg:"token is required."})

        try{
            token = token.replace("Bearer ","")
            let decodedToken = jwt.verify(token,process.env.JWT_Key);
            if(!decodedToken) return res.status(401).send({code:401,status:"failed",msg:"token is invalid."})

            let userData = await queryModule.getUser({Email:decodedToken.Email});
            await queryModule.updateResetPassword(userData._id,password);
            return res.status(202).send({code:202,status:"success",msg:"Update successfully!"});
        }catch(err){
            console.log(err)
            return res.status(422).send({code:422,status:"failed",msg:err.message});
        }
    }

}


 
