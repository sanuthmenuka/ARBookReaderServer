const Publisheright = require("../models/Publisherrightsmodel");
const User = require("../models/userModel");

const requestpublisherrights = async (req, res) => {
    const userId = req.userId;
   const {
    bio,
    haspublishedbefore,
    prevouspublications,

  } = req.body;

  console.log(req.body);

  //convert 'haspublishedbefore' from sting to boolean
  let haspublished = false
  if(haspublishedbefore == "Yes"){
    haspublished = true;
  }
  else{
    haspublished = false;
  }


  const newPublisherright = new Publisheright({
    userId: userId,
    bio: bio,
    haspublishedbefore: haspublished,
    prevouspublications: prevouspublications,
    status : "pending"
    
  });

  try{
    await newPublisherright.save();
    res.status(200).json({ message: 'Sent publisher right request' });
   
  }

 catch (error) {
  console.error("Error sending the publisher right request:", error);
  res.status(500).json({ error: "Failed to send the publisher right request"})
 }
 
}

//admin request to get all the pending publisher requests
const getpublisherrightsrequest = async (req, res) => {
    try {
        const publisherRightRequests = await Publisheright.find({ status: "pending" }).populate('userId',['firstName', 'lastName']);

       /* publisherRightRequests.forEach(request => {
            console.log(request.userId.firstName); // First name of the user associated with this request
            console.log(request); // First name of the user associated with this request
          }); */

        res.status(200).json({
          length: publisherRightRequests.length,
          data: { publishertRequests:publisherRightRequests },
        });
        
    }
    catch(error){
      console.error("Error getting 'pending' publisher right requests:", error);
      res.status(500).json({ error: "Failed to get 'pending' publisher right requests"})

    }
}


//admin request to get all the pending publisher requests
const grantpublisherights = async (req, res) => {
  try {
      const {request_id,access} = req.query;
      //console.log(request_id,access);
      const foundRequest = await Publisheright.findOne({ _id: request_id });
    
        if (foundRequest) {
          const {userId} = foundRequest;
          //console.log(userId)
          // Update the publisher request status
          foundRequest.status = access;
          
          // Save the updated user document
          await foundRequest.save();
          try{
            const foundUser = await User.findOne({ _id: userId });
            if (foundUser) {
              // Update the user's publisher status
              if(access==='access granted'){
                foundUser.publisher = true;
              }
              // Save the updated user document
              await foundUser.save();
           } 
          }

          catch(error){
            res.status(500).json({ error: "Failed to find ownerof the publisher right acess request"})
          }
    
          //console.log("User updated:", foundUser);
          res.status(200).json({message:"Request handled"}); 
          }
       
          }
          catch(error){
            console.error("Error handling acccess request", error);
            res.status(500).json({ error: "Failed to handle publisher right acess request"})

          }
        }
module.exports = {requestpublisherrights, getpublisherrightsrequest,grantpublisherights};

