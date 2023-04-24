// Create a Token and Saving in Cookie

const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    // Options for cookie

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "Development" ? false : true,
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        user,
        token
    })
}

export default sendToken;