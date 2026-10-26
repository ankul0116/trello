const jwt=require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;


function authMiddleware(req,res,next){
  try{
       const token=req.headers.token;
       if(!token){
        return res.status(401).json({
          success : false,
          message : " Token not provided"
        });
       }
       const decoded=jwt.verify(token,JWT_SECRET)
       const userId=decoded.userId
       if(userId){
         req.userId=userId
         next();
       }else {
             res.status(401).json({
                 message: "Invalid token"
             })
         }
  }
  catch(error){
    return res.status(401).json({
      success : false,
      message : "Invalid token"

    })

  }
}

module.exports={
  authMiddleware : authMiddleware
}