import ErrorHandler from "../utils/errorhandler.js";

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //* Wrong MongoDb Casting ErrorHandler
    if(err.name === 'CastError'){
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //* Mongoose duplicate key error
    if(err.code === 11000){
        const message = `Duplicate key: ${Object.keys(err.keyValue)} Entered`

        err = new ErrorHandler(message, 400);
    }

    //* Wrong JWT error
    if(err.name === "JsonwebTokenError"){
        const message = `Json Web Token is invalid, Try again`;
        err = new ErrorHandler(message, 400)
    }

    //* Expired JWT error
    if(err.name === "TokenExpiredError"){
        const message = `Json Web Token is expired, Try again`;
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

export default errorHandler;