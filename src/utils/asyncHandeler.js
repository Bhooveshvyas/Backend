// THIS IS SECOND METHOD TO HANDLE ASYNC ERRORS
const asyncHandeler = (requestHandeler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandeler(req, res, next)).catch((error) => { next(error) });
    }
}








export { asyncHandeler };


// async handeller is a type higher order function that wraps async functions to handle errors

// const asyncHandeler = () => {}
// const asyncHandeler = (fn) => () => {}
// const asyncHandeler = (fn) => async () => {}
// APPROACH-1 USING TRY-CATCH
// const asyncHandeler = (fn) => async (req, res, next){
//     try {
//         await fn(req, res, next);
//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }