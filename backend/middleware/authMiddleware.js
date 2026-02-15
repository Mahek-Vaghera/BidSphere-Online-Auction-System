import { getUser } from "../services/auth.service.js";

async function restrictToLoggedinUserOnly (req, res, next){
  try {
    const userToken = req.cookies?.token;

    if(!userToken) 
      return res.status(400).json({message:"You are not logged in, go to login page"});
    
    const user = await getUser(userToken); //wait until this work is finished before going to the next line

    if(!user) 
      return res.status(400).json({message:"The user belonging to this token does no longer exist."});
    
    req.user = user;//request.user will now hold the user object
      //logged-in user’s details that we attach to the request after verifying the token.
    next();
  }
  catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

async function checkAuth (req, res, next){ //this function only stores user info in req.user without any restriction like must be loggined in
  try {  
    const userToken = req.cookies?.token;

    const user = await getUser(userToken);
    
    req.user = user;
    next();
  }
  catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

export {
    restrictToLoggedinUserOnly,
    checkAuth
}