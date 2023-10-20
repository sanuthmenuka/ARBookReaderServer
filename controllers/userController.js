const User = require("../models/userModel");
const Book = require("../models/Bookmodel")
const jwt = require("jsonwebtoken");
const storage = require("../controllers/firebase");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

//creates the jwt tokens
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

//login user
const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  console.log("request",email, password);
  try {
    const user = await User.login(email, password);

    //create token
    const token = createToken(user._id); //user is a document created by mongoose
    
    res.cookie("access-token",token,{
      maxAge : 3*60*60*24*1000,

    })
    
    res.status(200).json({ email, token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

//signup
const signupUser = async (req, res) => {
  const {firstName,lastName,email, password,confirmPassword} = req.body;
  console.log("request",req.body);
  try {
    const user = await User.signup(firstName,lastName,email, password,confirmPassword);

    //create token
    const token = createToken(user._id); //user is a document created by mongoose

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserDetails = async (req,res) =>{
  const userId = req.userId;
  try {
    const foundUser = await User.findOne({ _id: userId });
    console.log(foundUser);
    if (foundUser) {
      
      const {email ,firstName,lastName,profilePicture,addedtoLibrary} = foundUser;
      
      

      const users_books = await Book.find({ _id: { $in: addedtoLibrary } })
      console.log(users_books);

      const userDetails = {
        email,
        firstName,
        lastName,
        profilePicture,
        users_books,
      }; 

      res.status(200).json({userDetails}); 
    } else {
      res.status(404).json({ message: 'User not found' });
    }
    
  } catch (error) {
    console.error('Error finding User:', error);
    res.status(500).json({ message: error.message });
  }

}

const editProfile = async (req,res) =>{
  console.log(req.body)
  const userId = req.userId;
  
  const {
    firstName,
    lastName,

  } = req.body;

  let profilePictureUrl = null;
  
  const profilePicture = req.files.find(
    (file) => file.fieldname === "ProfilePicture"
  );
  console.log(profilePicture);


  if(profilePicture){
    const ImageRef = ref(storage, `images/${userId }.jpg`);
    const metadata = {
      contentType: "image/jpeg",
    };
  
    await uploadBytes(ImageRef, profilePicture.buffer, metadata)
      .then((snapshot) => {
        console.log("Uploaded a blob or file!");
      })
      .catch((coverImageError) => {
        console.error("Error uploading cover image:", profilePicture);
        // Handle the error as needed, e.g., return an error response.
        return res.status(500).json({ error: "Failed to upload cover image" });
      });
  
    profilePictureUrl = await getDownloadURL(ImageRef);
    console.log(profilePictureUrl)
  }
 


  try {
    const foundUser = await User.findOne({ _id: userId });
    //console.log(foundUser);
    
    if (foundUser) {
       // Update the user's firstName and lastName
       foundUser.firstName = firstName;
       foundUser.lastName = lastName;
       if(profilePicture){
       foundUser.profilePicture = profilePictureUrl;
       }
       // Save the updated user document
       await foundUser.save();
 
       console.log("User updated:", foundUser);
      
     
    } else {
      res.status(404).json({ message: 'User not found' });
    }
    
  } catch (error) {
    console.error('Error finding User:', error);
    res.status(500).json({ message: error.message });
  }
}

const addToLibrary = async (req,res) =>{
 //id of the book needed to be added to user's library
  const {book_id} = req.query;
  console.log(book_id);
  //user's id
  const userId = req.userId;
  try {
    const foundUser = await User.findOne({ _id: userId });
    //console.log(foundUser);
    
    if (foundUser) {
       //add new book to user's libaray
       foundUser.addedtoLibrary.push(book_id);

       // Save the updated user document
       await foundUser.save();
 
       console.log("User updated:", foundUser);
       res.status(200).json({ message: 'Added to library' });
    } 
    else {
      res.status(404).json({ message: 'User not found' });
    }
    
  } catch (error) {
    console.error('Error finding User:', error);
    res.status(500).json({ message: error.message });
  }

  
  
}


module.exports = { loginUser, signupUser , getUserDetails, editProfile ,addToLibrary};
