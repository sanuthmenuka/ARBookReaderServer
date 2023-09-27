const express=require('express')
const router=express.Router()
const {createTokens,validateToken} = require("../controllers/JWT")

//controller functions
const {loginUser,signupUser,getUserDetails,editProfile}=require('../controllers/userController')

router.post('/login',loginUser)

router.post('/signup',signupUser)

router.get('/getUserDetails',validateToken,getUserDetails)

router.post('/editProfile',validateToken,editProfile)

module.exports=router

