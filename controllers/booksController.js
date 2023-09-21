const Book = require("../models/Bookmodel");
const storage = require("../controllers/firebase");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    console.log(books); // Fetch all books from the database
    res.status(200).json(books); // Return the list of books as JSON
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//upload to firebase and then to the database
const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      language,
      ageCategory,
      genre,
      ARcontent,
      description,
      tag1,
      tag2,
    } = req.body;

    const coverImageFile = req.files.find(
      (file) => file.fieldname === "coverImage"
    );

    const uploadedBookFile = req.files.find(
      (file) => file.fieldname === "uploadedBook"
    );
    console.log(uploadedBookFile);

    // Upload cover image to Firebase Storage

    const ImageRef = ref(storage, `images/${title}-${author}.jpg`);
    const metadata = {
      contentType: "image/jpeg",
    };

    await uploadBytes(ImageRef, coverImageFile.buffer, metadata)
      .then((snapshot) => {
        console.log("Uploaded a blob or file!");
      })
      .catch((coverImageError) => {
        console.error("Error uploading cover image:", coverImageError);
        // Handle the error as needed, e.g., return an error response.
        return res.status(500).json({ error: "Failed to upload cover image" });
      });

    const coverImageUrl = await getDownloadURL(ImageRef);

    //Upload boook to
    const bookRef = ref(storage, `books/${title}-${author}.pdf`);
    const bookMetadata = {
      contentType: "application/pdf",
    };

    await uploadBytes(bookRef, uploadedBookFile.buffer, bookMetadata)
      .then((snapshot) => {
        console.log("Uploaded book successfully!");
      })
      .catch((bookUploadError) => {
        console.error("Error uploading book:", bookUploadError);
        // Handle the error as needed, e.g., return an error response.
        return res.status(500).json({ error: "Failed to upload book" });
      });
    const bookUrl = await getDownloadURL(bookRef);
    // Create a new book in the database
    const newBook = new Book({
      title: title,
      author: author,
      language: language,
      ageCategory: ageCategory,
      genre: genre,
      ARcontent: ARcontent,
      description: description,
      tag1: tag1,
      tag2: tag2,
      Link: bookUrl, // Set the book link to the Firebase Storage URL
      image: coverImageUrl, // Set the cover image URL from Firebase Storage
    });

    await newBook.save();

    res.status(201).json({ message: "Book added successfully" });
    console.log("Book added to db successfully");
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Failed to add book" });
  }
};

const getBookById = async (req, res) => {};

module.exports = { getBooks, getBookById, addBook };
