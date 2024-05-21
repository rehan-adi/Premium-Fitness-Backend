import userModel from "../models/user.model.js";
import becrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "All Fields are required" });
    }

    const oldUser = await userModel.findOne({ email: email });
    if (oldUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashpassword = await becrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashpassword,
    });
    return res
      .status(200)
      .json({ success: true, message: "User created successfully", user });
  } catch (error) {
    console.log(error, "can not register");
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ success: false, message: "all fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User is not registered with this email. Please register to continue.",
      });
    }

    const passwordmatch = becrypt.compare(password, user.password);

    if (passwordmatch) {
      const token = jwt.sign(
        { userid: user._id, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      
      return res
        .status(200)
        .json({ success: true, token: token, message: "Login successfully" });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    };

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be login. Please try again.",
    });
  }
};

export { register, login };
