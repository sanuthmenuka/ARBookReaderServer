const express=require('express');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router=express.Router();

const {createTokens,validateToken} = require("../controllers/JWT");

//controller functions
const {
    requestpublisherrights,
    getpublisherrightsrequest,
    grantpublisherights
  } = require("../controllers/publisherrightsController");


router.post("/requestpublisherrights",upload.any(),validateToken, requestpublisherrights);
router.get("/getpublisherrightsrequest",getpublisherrightsrequest);
router.get("/grantpublisherights",grantpublisherights);

module.exports=router