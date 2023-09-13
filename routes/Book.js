const express = require("express");
const router = express.Router();

//controller functions
const { getBooks, getBookById } = require("../controllers/booksController");

router.get("/getBooks", getBooks);
router.get("/getBooks/:id", getBookById);

module.exports = router;
