const UserModel = require('../model/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const handleUserSignin = async(req, res) => {
    try {

        const {email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(!user) return res.json({msg: 'User is Not Found'});

        if(await bcrypt.compare(password , user.password)) {
        const token = await jwt.sign({id: user._id, email: user.email}, 'THIS IS NOT TO TELL') ;
        return res.json({msg:"Login Done" , token})
            
        }else{
            return res.json({msg:"Invalid Password"})
        }
        
        
    } catch (error) {
        console.log(error);
    }
}

const handleUserSignup = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        const user = await UserModel.findOne({email});
        if(user) return res.status(401).json({msg:"User already Exits"});

       const hasedPassword = await bcrypt.hash(password,4);
       const usertoSave = new UserModel({
            name,
            email,
            password: hasedPassword
        })
        const token = await jwt.sign({id: usertoSave._id, email: usertoSave.email}, 'THIS IS NOT TO TELL');
        await usertoSave.save();
        return res.status(200).json({msg:"user Created", token})
        
    } catch (error) {
        console.log(error);
    }
}

const verifyJwtForClient = async (req, res) => {

    try {
        const token = req.body.token;
        console.log("body --> " , token);
        if (token) {
            const decodedToken = await jwt.verify(token, 'THIS IS NOT TO TELL');
            const userEmail = decodedToken.email;
            const userId = decodedToken.id;
            return res.json({ userEmail, userId })
        } else {
            return res.json({ msg: "token not found" })
        }
    } catch (error) {
        console.error('Error decoding JWT:', error.message);
        const errMessage = error.message
        return res.json({ msg: errMessage })
    }
}

module.exports = {
    handleUserSignin,
    handleUserSignup,
    verifyJwtForClient
}