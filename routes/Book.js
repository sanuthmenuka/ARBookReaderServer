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
  removePublishedBook,
} = require("../controllers/booksController");

router.get("/getBooks",validateToken, getBooks);
router.get("/getBooks/:id", getBookById);
router.get("/getBookByTitle/:title", getBookByTitle);
router.post("/addBook",validateToken, upload.any(), addBook);
router.delete('/removePublishedBook/:id',validateToken,removePublishedBook);
//router.post("/addBook",  addBook);

module.exports = router;
