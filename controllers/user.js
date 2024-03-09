const UserModel = require('../model/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const querystring = require('querystring');
const axios = require('axios');

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

const redirectURI = "auth/google";


const getGoogleAuthURL = () => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: `${process.env.SERVER_ROOT_URI}/${redirectURI}` || 'ankit',
        client_id: process.env.CLIENT_ID || 'ankit',
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };
    console.log("Redirect URI:", options.redirect_uri);

    return `${rootUrl}?${querystring.stringify(options)}`;
}

const handleOAuthGetRequest = async (req, res) => {
    return res.send(getGoogleAuthURL());
}



async function getTokens({ code, clientId, clientSecret, redirectUri }) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
    };

    try {
        const response = await axios.post(
            url,
            querystring.stringify(values),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Failed to fetch auth tokens');
        throw new Error(error.message);
    }
}



const handleUserWithCode = async (req, res) => {

    const code = req.query.code
    console.log("code: ", code);

    const { id_token, access_token } = await getTokens({
        code,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: `${process.env.SERVER_ROOT_URI}/${redirectURI}`,
    });

    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
        .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            }
        )
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
        });

    const token = jwt.sign(googleUser, process.env.JWT_SECRET);
    console.log("token: ", token);

    res.cookie(process.env.COOKIE_NAME, token, {
        maxAge: 900000,
        httpOnly: true,
        secure: false,
    });

    res.redirect(process.env.SERVER_ROOT_URI);
}


const handleGoogleUserMe = async (req, res) => {

    try {
        const decoded = jwt.verify(req.cookies[COOKIE_NAME], process.env.JWT_SECRET);
        console.log("decoded", decoded);
        return res.send(decoded);
    } catch (err) {
        console.log(err);
        res.send(null);
    }


}


module.exports = {
    handleUserSignin,
    handleUserSignup,
    verifyJwtForClient,
    getGoogleAuthURL,
    handleOAuthGetRequest,
    getTokens,
    handleUserWithCode,
    handleGoogleUserMe
}

