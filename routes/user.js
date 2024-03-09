const express = require('express');
const router = express.Router();

const { handleUserSignup, handleUserSignin, verifyJwtForClient, handleOAuthGetRequest, handleUserWithCode, handleGoogleUserMe } = require('../controllers/user')

router.post('/api/v1/signup', handleUserSignup);
router.post('/api/v1/signin', handleUserSignin);

router.post('/api/v1/verify', verifyJwtForClient);

//google oauth
router.get('/auth/google/url', handleOAuthGetRequest);

router.get('/auth/google', handleUserWithCode);


router.get('/get/me', handleGoogleUserMe);


module.exports = router;