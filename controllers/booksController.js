const Book = require("../models/Bookmodel");
const storage = require("../controllers/firebase");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");


//return All , recent , most popular or AR books according to the request parameters
const getBooks = async (req, res) => {
  //console.log(req);
  try {
    console.log(req.userId);
    const {selectedAppbarOption, language, genre, ageCategory } = req.query;

    // Construct an initial query object
    const query = {};  

    // When AR books are requested from the frontend, set the search query for AR content to "Yes".
    if(selectedAppbarOption === "AR"){
      query.ARcontent = "Yes";
    }

    // Add filters for language query parameters
    if (language) {
      query.language = language;
    }
    if (genre) {
      query.genre = genre;
    }
    if (ageCategory) {
      query.ageCategory = ageCategory;
    }
    
    let response = null;
    // Construct the final query based on the safe query object
    if(selectedAppbarOption==="Recent"){ 
      //sort the documents based on the _id field in descending order. id field contains a time stamp
      response = await Book.find(query).sort({ _id: -1 }).limit(20);
      //console.log("response",response);
    }
    else if(selectedAppbarOption==="Most Popular"){ 
      //Get most popular books by sorting the documents based on the no of ratings in descending order.
      response = await Book.find(query).sort({ ratings : -1 }).limit(20);
      //console.log("response",response);
    }
    else{
      response = await Book.find(query);
      //console.log("response",response);
    }
   
    res.status(200).json({
      length: response.length,
      data: { books: response },
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};



const getBookById = async (req, res) => {};

/*get a book with a particular title, from the DB*/
const getBookByTitle = async (req, res) => {
  /* get the title is passed as a URL parameter */
  const { title } = req.params; 
  console.log(title);
  try {
    const foundBook = await Book.findOne({ title: title });
    if (foundBook) {
      res.status(200).json({ foundBook }); 
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
    
  } catch (error) {
    console.error('Error finding book:', error);
    res.status(500).json({ message: error.message });
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
    
    console.log(req.body);

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

module.exports = { getBooks, getBookById,getBookByTitle, addBook };
