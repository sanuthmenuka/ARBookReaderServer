const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { createTokens, validateToken } = require("../controllers/JWT");

//controller functions
const {
  loginUser,
  signupUser,
  getUserDetails,
  editProfile,
  addToLibrary,
  removeLibraryBook,
  createSubscription,
  success,
} = require("../controllers/userController");

router.post("/login", loginUser);

router.post("/signup", signupUser);

router.get("/getUserDetails", validateToken, getUserDetails);

router.post("/editProfile", validateToken, upload.any(), editProfile);

router.get("/addToLibrary", validateToken, addToLibrary);

router.delete("/removeLibraryBook/:id", validateToken, removeLibraryBook);

router.post("/create-subscription", createSubscription);

router.get("/success", success);

module.exports = router;
