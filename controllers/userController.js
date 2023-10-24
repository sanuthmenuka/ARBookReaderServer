const User = require("../models/userModel");
const Book = require("../models/Bookmodel");
const jwt = require("jsonwebtoken");
const storage = require("../controllers/firebase");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");

// Include necessary dependencies for handling PayPal operations
const paypal = require("paypal-rest-sdk"); // Use the appropriate PayPal SDK for Node.js

// Configure PayPal with your client ID and secret
paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id:
    "AQ6UngTzAsKoTY2MJgQXKNN8IlBXa-E3i7NxRp2LZxVlylz-nkr0YouK5oFfo2A1S0qJTJdWDBf2Vinf",
  client_secret:
    "EB1uDEP7CQNPf0O3wp18_WbRQPXBp6KAp0uBf2GBcbPAijqT_eH96NZpuiMQppA_uj0OK5zwmj8GgRnw",
});

// Define a route for creating a PayPal subscription
const createSubscription = async (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:4000/api/user/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Redhock Bar Soap",
              sku: "001",
              price: "5.00",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "5.00",
        },
        description: "Washing Bar soap",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log(payment);
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
};

const success = async (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  console.log("this");

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "5.00",
        },
      },
    ],
  };

  // Obtains the transaction details from paypal
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send("Success");
      }
    }
  );
};

//creates the jwt tokens
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

//login user
const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  console.log("request", email, password);
  try {
    const user = await User.login(email, password);
    const { userRole } = user;
    console.log(userRole);

    //create token
    const token = createToken(user._id); //user is a document created by mongoose

    res.cookie("access-token", token, {
      maxAge: 3 * 60 * 60 * 24 * 1000,
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ email, token, userRole });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

//signup
const signupUser = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  try {
    const user = await User.signup(
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    );

    //create token
    const token = createToken(user._id); //user is a document created by mongoose

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  const userId = req.userId;
  try {
    const foundUser = await User.findOne({ _id: userId });
    console.log("user details requested");
    if (foundUser) {
      const {
        email,
        firstName,
        lastName,
        profilePicture,
        addedtoLibrary,
        publisher,
        publishedBooks,
        userRole,
        paid,
      } = foundUser;

      const users_books = await Book.find({ _id: { $in: addedtoLibrary } });
      console.log(users_books);

      const users_published_books = await Book.find({
        _id: { $in: publishedBooks },
      });
      console.log(users_published_books);

      const userDetails = {
        email,
        firstName,
        lastName,
        profilePicture,
        users_books,
        publisher,
        users_published_books,
        paid,
      };

      res.status(200).json({ userDetails });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error finding User:", error);
    res.status(500).json({ message: error.message });
  }
};

const editProfile = async (req, res) => {
  console.log(req.body);
  const userId = req.userId;

  const { firstName, lastName } = req.body;

  let profilePictureUrl = null;

  const profilePicture = req.files.find(
    (file) => file.fieldname === "ProfilePicture"
  );
  console.log(profilePicture);

  if (profilePicture) {
    const ImageRef = ref(storage, `images/${userId}.jpg`);
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
    console.log(profilePictureUrl);
  }

  try {
    const foundUser = await User.findOne({ _id: userId });
    //console.log(foundUser);

    if (foundUser) {
      // Update the user's firstName and lastName
      foundUser.firstName = firstName;
      foundUser.lastName = lastName;
      if (profilePicture) {
        foundUser.profilePicture = profilePictureUrl;
      }
      // Save the updated user document
      await foundUser.save();

      //console.log("User updated:", foundUser);
      res.status(200).json({ foundUser });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error finding User:", error);
    res.status(500).json({ message: error.message });
  }
};

const addToLibrary = async (req, res) => {
  //id of the book needed to be added to user's library
  const { book_id } = req.query;
  console.log(book_id);
  //user's id
  const userId = req.userId;
  try {
    const foundUser = await User.findOne({ _id: userId });
    //console.log(foundUser);

    if (foundUser) {
      //check if the user has activated the subscription plan
      if (foundUser.paid) {
        //add new book to user's libaray
        foundUser.addedtoLibrary.push(book_id);

        // Save the updated user document
        await foundUser.save();

        console.log("User updated:", foundUser);
        res.status(200).json({ message: "Success" });
      } else {
        res.status(201).json({ message: "Activate" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error finding User:", error);
    res.status(500).json({ message: error.message });
  }
};

//remove book from user's personal library
//first  check if that book is avilable in user's library and if found delete
const removeLibraryBook = async (req, res) => {
  /* get the book id whichpassed as a URL parameter */
  const bookID = req.params.id;
  const userId = req.userId;
  console.log(bookID, userId);

  try {
    const foundUser = await User.findOne({ _id: userId });

    if (foundUser) {
      // Use the pull method to remove the bookID directly from the personal library array
      foundUser.addedtoLibrary.pull(bookID);
      const deletedBook = await foundUser.save();
      if (deletedBook) {
        console.log("Deleted book", bookID);
        res.status(200).json({ deletedBook });
      } else {
        res.status(404).json({ message: "Could not delete the book" });
      }
    }
  } catch (error) {
    console.error("Error finding the user", error);
    res.status(500).json({ message: error.message });
  }
};

//activate the subscription plan for the user
const activateSubscription = async (req, res) => {
  /* get the user id using the JWT token*/
  const userId = req.userId;
  const subscriptionId = req.params.subscriptionid;
  console.log(userId, subscriptionId);

  try {
    const foundUser = await User.findOne({ _id: userId });

    if (foundUser) {
      //set paid to true (by default it is set to false)
      foundUser.paid = true;

      foundUser.save();
      res.status(200).json({ message: "subsciption plan activated" });
    }
  } catch (error) {
    console.error("Error activating the subscription plan", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  signupUser,
  getUserDetails,
  editProfile,
  addToLibrary,
  removeLibraryBook,
  createSubscription,
  success,
  activateSubscription,
};
