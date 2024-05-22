import jwt from "jsonwebtoken";

const islogin = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Token is invalid" });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Something went wrong while validating the token`,
    });
  }
};

export default islogin;
