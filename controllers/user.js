const UserModel = require('../model/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const querystring = require('querystring')

const handleUserSignin = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.json({ msg: 'User is Not Found' });

        if (await bcrypt.compare(password, user.password)) {
            const token = await jwt.sign({ id: user._id, email: user.email }, 'THIS IS NOT TO TELL');
            return res.json({ msg: "Login Done", token })

        } else {
            return res.json({ msg: "Invalid Password" })
        }


    } catch (error) {
        console.log(error);
    }
}

const handleUserSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) return res.status(401).json({ msg: "User already Exits" });

        const hasedPassword = await bcrypt.hash(password, 4);
        const usertoSave = new UserModel({
            name,
            email,
            password: hasedPassword
        })
        const token = await jwt.sign({ id: usertoSave._id, email: usertoSave.email }, 'THIS IS NOT TO TELL');
        await usertoSave.save();
        return res.status(200).json({ msg: "user Created", token })

    } catch (error) {
        console.log(error);
    }
}

const verifyJwtForClient = async (req, res) => {

    try {
        const token = req.body.token;
        console.log("body --> ", token);
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

const client_id = process.env.CLIENT_ID
const redirectURI = "auth/google";
const getGoogleAuthURL = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: `${process.env.SERVER_ROOT_URI}/${redirectURI}`,
        client_id: client_id,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
}

const handleOAuthGetRequest = async (req, res) => {

    return res.send(getGoogleAuthURL());

}


module.exports = {
    handleUserSignin,
    handleUserSignup,
    verifyJwtForClient,
    getGoogleAuthURL,
    handleOAuthGetRequest
}