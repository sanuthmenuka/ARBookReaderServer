const jwt = require("jsonwebtoken");

const createTokens = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
}
//JWT Token validation middleware
const validateToken = (req,res,next)=>{
    
    const accessToken = req.cookies["access-token"]
    //console.log(accessToken);

    if(!accessToken){
        return res.status(400).json({error:"User not Authenticated!"});
    }
    //verify the token using secret
    try{
        
        const validToken = jwt.verify(accessToken, process.env.SECRET)
       
        // Get the user's ID from the decoded token
        const userId = validToken._id;

        console.log("Token verification successful. User ID:", userId);
        //get users id
        if(validToken){
            req.authenticated = true;
            req.userId = userId;
         
            return next();

        }
        else {
            return res.status(401).json({ error: "Invalid token." }); // Token is invalid
          }
    }
    catch(err){
        return res.status(403).json({error: "Token verification failed."})

    }


}

module.exports = {createTokens,validateToken};

