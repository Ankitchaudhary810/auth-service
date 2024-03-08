const express = require('express');
const router = express.Router();

const {handleUserSignup,handleUserSignin,verifyJwtForClient} = require('../controllers/user')

router.post('/api/v1/signup', handleUserSignup);
router.post('/api/v1/signin',handleUserSignin);

router.post('/api/v1/verify',verifyJwtForClient);



module.exports = router;