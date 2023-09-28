const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {createTokens,validateToken} = require("../controllers/JWT")

//controller functions
const {
  getBooks,
  getBookById,
  addBook,
  getBookByTitle,
} = require("../controllers/booksController");

router.get("/getBooks",validateToken, getBooks);
router.get("/getBooks/:id", getBookById);
router.get("/getBookByTitle/:title", getBookByTitle);
router.post("/addBook", upload.any(), addBook);
//router.post("/addBook",  addBook);

module.exports = router;
