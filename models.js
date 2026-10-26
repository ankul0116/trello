const mongoose=require("mongoose")
if (process.env.MONGO_URL) {
  mongoose
    .connect(process.env.MONGO_URL.trim())
    .then(() => console.log("Connected to MongoDB successfully!"))
    .catch((err) => console.error("MongoDB connection error:", err));
}




 //username and password=> id, username, password
  //org=>org_id,title ,description,admin_id,members{id}
  //boards =>board_id ,title,org_id
  //issues=>issue_id title,board_id,issue_state( next_up, progress,done)
  const userSchema=mongoose.Schema({
    username : String,
    email : String,
    password : String
  })
  const organizationSchema=mongoose.Schema({
    title : String,
    description : String,
    adminId : mongoose.Types.ObjectId, 
    members : [mongoose.Types.ObjectId]
  })
  const boardSchema=mongoose.Schema({
    title : String,
    orgId :mongoose.Types.ObjectId,

  })
  const issueSchema=mongoose.Schema({
    
   title : String,
   boardId :mongoose.Types.ObjectId ,
   status : String
   
  })


  const organizationModel = mongoose.model("organizations", organizationSchema);
  const userModel=mongoose.model("users",userSchema);
  const boardsModel=mongoose.model("boards",boardSchema);
  const issuesModel=mongoose.model("issues",issueSchema);
  module.exports ={
    organizationModel,
    userModel,
    boardsModel,
    issuesModel
  }