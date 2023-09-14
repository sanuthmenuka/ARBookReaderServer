const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

//controller functions
const {
  getBooks,
  getBookById,
  addBook,
} = require("../controllers/booksController");

router.get("/getBooks", getBooks);
router.get("/getBooks/:id", getBookById);
router.post("/addBook", upload.any(), addBook);

module.exports = router;
