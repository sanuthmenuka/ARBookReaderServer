const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

//creates the jwt tokens
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

//login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("request");
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
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);

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
      
      const {email ,firstName,lastName} = foundUser;
      const userDetails = {
        email,
        firstName,
        lastName,
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
  
  try {
    const foundUser = await User.findOne({ _id: userId });
    console.log(foundUser);
    
    if (foundUser) {
      foundUser.update({ firstName: req.body.firstName, lastName : req.body.lastName })
      .then(output => {
        console.log(output)
        })
      
     
    } else {
      res.status(404).json({ message: 'User not found' });
    }
    
  } catch (error) {
    console.error('Error finding User:', error);
    res.status(500).json({ message: error.message });
  }
}


module.exports = { loginUser, signupUser , getUserDetails, editProfile };
