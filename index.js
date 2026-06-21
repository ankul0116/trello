  const express=require("express")
  const app = express();

  
  
  
  
  //username and password=> id username password
  //org=>0rg_id,title ,discription,admin,members
  //boards =>board_id ,title,org_id
  //issues=>issue_id title,board_id
  const users = [];
  const org = [];
  const boards = [];
  const issuses = [];



  app.lisen(3000);