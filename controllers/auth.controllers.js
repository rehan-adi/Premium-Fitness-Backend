import userModel from "../models/user.model.js";
import becrypt from "bcrypt";

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

export default register;
