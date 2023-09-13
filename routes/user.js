const express=require('express')
const router=express.Router()

//controller functions
const {loginUser,signupUser}=require('../controllers/userController')

router.post('/login',loginUser)

router.post('/signup',signupUser)

module.exports=router

