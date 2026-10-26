 const { organizationModel } = require("./models");

async function orgAccess(req, res, next) {
  try{
    const userId = req.userId;  // from authMiddleware
    const organizationId = req.body?.organizationId || req.query?.organizationId || req.headers?.['organizationid'] || req.headers?.['organization-id'];
    
    if(!organizationId){
       return res.status(400).json({
           message : "organizationId is required"
       })
    }
    const organization = await organizationModel.findById(organizationId);
    
    if(!organization){
       return res.status(404).json({
           message : "organization don't exist "
       })   
    }
    const isMember = organization.members.some(memberId => 
      memberId.toString() === userId.toString()
    );
    const isAdmin = organization.adminId.toString() === userId.toString();
  
    if (!isMember && !isAdmin) {

      return res.status(403).json({
        message: "You don't have access to this organization" 
        });
    }
    req.organization = organization;
    next(); 
  }catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
  }
     
 };

module.exports={
  orgAccess : orgAccess
}