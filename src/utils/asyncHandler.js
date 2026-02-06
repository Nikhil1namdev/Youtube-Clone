const asyncHandler=()=>{

    return 
}

export default asyncHandler


//2nd way using try catch
// const asyncHandler=(fn)=> async (req,res,next)=>{
//     try{
//          await fn(req,res,next)
//     }
//     catch(err)
//     {
//         res.status(err.code|| 500).json({
//             success:false,
//             message:err.message
//         })
//     }

// }


//3rd way is promises

// const asyncHandler=(requestHandler)=>{
//     (req,res,next)=>{
//        Promise.resolve(requestHandler(req,res,next)).catch((err)=>{
//         next(err)
//        })
//     }
   
// }