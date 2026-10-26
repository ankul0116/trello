require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { authMiddleware } = require("./middleware");
const { orgAccess } = require("./orgAccessMiddleware");

const { userModel, organizationModel, boardsModel,  issuesModel } = require("./models");

const {signupSchema,createOrgSchema,
    addMemberSchema,createBoardSchema,createIssueSchema } =require("./validation");

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

   app.post("/signup",async (req,res)=>{ 
     try{
        const result = signupSchema.safeParse(req.body);

        if (!result.success) {
            // const arr=[];
            // for(let i=0;i<result.error.issues.length;i++){
            //     arr.push({
            //         field : result.error.issues[i].path,
            //         message : result.error.issues[i].message
            //     })
            // }
            return res.status(400).json({
            message: "Invalid input",
            errors: result.error.issues
            
            

            });
        }
        const { username, password ,email} = result.data;
        const userExists = await userModel.findOne({ 
            username: username
        });
            
        if (userExists) {
            return res.status(411).json({
                message: "User with this username already exists"
            })
        }
        const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = await userModel.create({
            username: username,
            email : email,
            password: hashPassword
        });

        res.json({
            id: newUser._id,
            message: "You have signed up successfully"
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error"
         });
    }
   });


    app.post("/signin",async (req,res)=>{
    try{
         const { username, password } = req.body;
         const userExists= await userModel.findOne({username :username});
         if(!userExists){
           return res.status(404).json({
                message: "user not found"
            })
         }

         const checkPassword = await bcrypt.compare(password,userExists.password)
         if(!checkPassword){
             return res.status(401).json({
                 message : " incorrect password"

             })

         }
         console.log(typeof(userExists._id))
         console.log(typeof(userExists.id))
         console.log(userExists._id)
         console.log(userExists.id)
        

         const token =jwt.sign({userId : userExists._id},JWT_SECRET);

         res.json({
            message: "Login successful",
            data : {token}
         })


    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
    })

    app.post("/organization",authMiddleware,async (req,res)=>{
        try{
            //jb ye auhtMiddleware se aayega to sath mai id bhi le kr aayega
            const userId=req.userId;
            const result = createOrgSchema.safeParse(req.body)
            const {title, description} =result.data

            const newOrg = await organizationModel.create({
              title : title,
              description : description,
              adminId : userId,
              members: []
            });
            res.status(201).json({
              message : " succcessully org created",
              organizationId : newOrg._id
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                 message: "Internal server error" 
            });
        }
    });


    app.post("/member", authMiddleware,orgAccess, async (req, res) => {
    try{
        const userId = req.userId; // sign in user id  middleware must be admin of org
        const result = addMemberSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message : "invalid format ",
                errors : result.error.issues
            })
        }
        const {organizationId ,memberUserUsername}= result.data;

        //const organizationId = req.body.organizationId;
        //const memberUserUsername = req.body.memberUserUsername;
        //  Find the specific organization by its ID
        const organization = await organizationModel.findById(organizationId);
       
        //  Find the user to be added by their username
        const memberUser = await userModel.findOne({ username: memberUserUsername });
        if (!memberUser) {
            return res.status(411).json({
                message: "No user with this username exists in our db"
            });
        }

        //  Check if the NEW MEMBER's ID is already in the array (not the admin's ID)
        const isMember = organization.members.some(memberId => memberId.equals(memberUser._id));
        if (isMember) {
            return res.status(400).json({
                message: "User already member"
            });
        }

        //Add member and save
        organization.members.push(memberUser._id);
        await organization.save();
        
        return res.status(201).json({
            message: "New member added!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
    });


    app.post("/board",authMiddleware,orgAccess, async (req,res)=>{
        try{
            const userId=req.userId;
            const result = createBoardSchema.safeParse(req.body);
            if(!result.success){
                return res.status(400).json({
                    message : " invalid format",
                    errors : result.error.issues
                })
            }
            const {organizationId,title}=result.data
             console.log("hi1")
         
            const newBoard= await boardsModel.create({
                title : title,
                orgId : organizationId
            })
             console.log("hi3")
            return res.status(201).json({
                message : "New board created",
                boardId: newBoard._id
            });
        }catch(error){
            console.error(error);
            res.status(500).json({ 
                 message: "Internal server error" 
            });
        }
    });


    app.post("/issue",authMiddleware,orgAccess,async  (req, res) => {
        try{
            // each board have many issue 
            const userId=req.userId //userId
            const result=createIssueSchema.safeParse(req.body);
            if(!result.success){
                return res.status(400).json({
                    message : "invalid format ",
                    error : result.error.issues
                })
            }
            const {organizationId ,boardId,title}=result.data
            const board =await boardsModel.findOne({
                _id: boardId,
                orgId: organizationId
            });
            if(!board){
                return res.status(404).json({
                    message:"Board not found"
                });
            } 
            // const boardId=board._id;     
            //issues=>issue_id ,issue_title,board_id,issue_state( next_up, progress,done)
            const newIssue= await issuesModel.create({
                title : title,
                boardId : boardId,
                status :"next_up"
            })
            res.status(201).json({
                message : "succcessully issue  created "
            })
        }catch(error){
            console.error(error)
            res.status(500).json({ 
                message: "Internal server error" 
            });
        }
    
    })

    /* GET REQUEST */

  
    app.get("/organization", authMiddleware, async (req, res) => {
    try{
        //only admin 
        // return all org whose adminId==userId
        const userId=req.userId;
        const organization = await organizationModel.find({
            adminId : userId
        }); 
        if(organization.length === 0 ){
           return  res.status(404).json({
                message : " No organization found "
            });
        }
        return res.json({
            message: "organization fetched successfully",
            data : organization
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }


    });


  app.get("/member", authMiddleware , orgAccess ,async (req, res) => {
    try{
        //only admin
        //return all from org by org id 
        const organizationId = req.body?.organizationId || req.query?.organizationId;
        const userId=req.userId;
        const organization = await organizationModel.findOne({
            adminId : userId,
            _id : organizationId
        }); 
        if(!organization){
            return res.status(404).json({
              message : "organization don't exist "
            });
        }
        const members = organization.members;
        const memberUsers = await userModel.find({
            _id: { $in: members }
        }).select("username");
        return res.json({
            data: members,
            memberDetails: memberUsers.map(member => ({
                id: member._id.toString(),
                username: member.username
            }))
         });
    }catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }  
  });


  app.get("/board", authMiddleware, orgAccess,async (req, res) => {
    try{
        // admin and members  of org 
        //return all boards from org by org id de
        const userId = req.userId;
        const organizationId = req.body?.organizationId || req.query?.organizationId;
        const boards = await boardsModel.find({
            orgId : organizationId
          })
          return res.json({
             message: "Boards fetched successfully",
             data : boards
          });
    }catch(error){
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
  });


  app.get("/issue", authMiddleware,orgAccess,async (req, res) => {
    try{
        //input 
        const userId=req.userId
        const organizationId = req.body?.organizationId || req.query?.organizationId;
        const boardId = req.body?.boardId || req.query?.boardId;
        const board = await boardsModel.findOne({
            _id: boardId,
            orgId: organizationId
        });
        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }
        const issues=await issuesModel.find({
            boardId: board._id
        });
        return res.json({
            message: "Issues fetched successfully",
            data: issues
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
  });


  // UPDATE

  app.put("/issue",authMiddleware,orgAccess, async (req, res) => {
    try{
        const userId = req.userId;
        const organizationId = req.body.organizationId
        const boardId=req.body.boardId;
        const issueId = req.body.issueId;
        const board = await boardsModel.findOne({
            _id : boardId,
            orgId: organizationId
        })
        if (!board) {
            return res.status(404).json({
            message: "Board not found"
            });
        }

        const issue = await issuesModel.findOne ({
            _id :issueId,
            boardId :  board._id
        });
        if (!issue) {
           return res.status(404).json({
               message: "Issue not found"
           });
        }
        if (issue.status === "next_up") {
           issue.status = "in_progress";
        }
        else if (issue.status === "in_progress") {
           issue.status = "done";
       }
       else {
        return res.status(400).json({
            message: "Issue already completed"
        });
       }
       await issue.save();
       res.json({
              message: "Issue status updated",
           issue
       });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }

  });


  //delete 

   app.delete("/organization",authMiddleware,async (req,res)=>{

    try{
        //only admin of org can delete it 
        const userId=req.userId;
        const organizationId= req.body.organizationId;
        //before deleting org find boards and issue
        const organization = await organizationModel.findOne({
            _id: organizationId,
            adminId: userId
        });

        if (!organization) {
            return res.status(404).json({
                message: "Organization not found or you are not the admin"
            });
        }
        const boards =await boardsModel.find({
            orgId : organizationId
        })
        const boardIds=boards.map(boards => boards._id);
        //boardIds is a arr which contain only ids  of all board
        // for(let i=0;i<boards.length;i++){

        //     let boardId = boards[i]._id;
        //     await issuesModel.deleteMany({
        //         boardId : boardId 
        //     })
        // }
        await issuesModel.deleteMany({
            boardId: {
                $in: boardIds
            }
        });

        await boardsModel.deleteMany({
            orgId : organizationId
        });
        await organizationModel.findOneAndDelete({
            _id : organizationId,
            adminId:userId
        });
        return res.status(200).json({
            message : "organization delete successfully",
        });

    }catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
    
   });

   app.delete("/member", authMiddleware ,  async(req, res) => {
    try{
        // only admin can delete member 
        const organizationId=req.body.organizationId
        const userId=req.userId;
        const memberId=req.body.memberId;

        const organization = await  organizationModel.findById(organizationId)
        
        if (!organization) { 
            return res.status(404).json({
           message : "don't exist "
         })
         
        }
        if(userId.toString() != organization.adminId.toString()){
             return res.status(403).json({
                    message: "only admin can delete member"
               });
        }
        organization.members = organization.members.filter(
                m => !m.equals(memberId)
         );
         await organization.save();

        return res.json({
            message : "delete successfully"
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
             message: "Internal server error"
        });
    }
   });
   
   app.delete("/issue",authMiddleware, orgAccess, async (req,res) =>{
    try{
        //issue can be deleted by admin or member 
        const organizationId = req.body.organizationId;
        const boardId = req.body.boardId;
        const issueId = req.body.issueId;
        const board = await boardsModel.findOne({
            _id : boardId,
            orgId: organizationId
        })
        if (!board) {
            return res.status(404).json({
            message: "Board not found"
            });
        }

        const issue = await issuesModel.findOne ({
            _id :issueId,
            boardId :  board._id
        });
        if(!issue){
            return res.status(404).json({
                message : " issue not found"
            })
        }
        await issuesModel.findByIdAndDelete(issueId);
        return res.status(200).json({
            message: "issue deleted successfully"
        });



    }catch(error){
        console.error(error);
        return res.status(500).json({
            message : " Internal server error"
        });
    }


   });
 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});