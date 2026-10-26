const { z } = require("zod");
//1.Defining a schema
const signupSchema =z.object({
    username : z.string().min(3).max(50),
    email : z.string().email(),
    password : z.string().min(4)
 });
 const createOrgSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional()
});
const addMemberSchema = z.object({
    organizationId: z.string().min(1),
    memberUserUsername: z.string().min(3).max(50)
});
const createBoardSchema=z.object({
  organizationId : z.string().min(1),
  title : z.string().min(3).max(50)
});
const createIssueSchema = z.object({
    organizationId: z.string().min(1),
    boardId: z.string(),
    title: z.string().min(1).max(200)
});
   
 
 module.exports = {
  signupSchema,
  createOrgSchema,
  addMemberSchema,
  createBoardSchema,
  createIssueSchema
 };