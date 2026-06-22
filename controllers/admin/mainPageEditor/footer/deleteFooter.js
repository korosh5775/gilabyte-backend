const Footer=require("../../../../models/footerSchema");

const deleteFooter=async(req,res,next )=>{
    try {
         const footer=await Footer.findOne();
         if(!footer){
            const error=new Error("Footer not found");
            error.statusCode=404;
            throw error;
         }
         await Footer.deleteOne();
         res.status(200).json({message:"Footer deleted successfully"});
    } catch (error) {
        next(error);
    }
   
}
module.exports=deleteFooter;
