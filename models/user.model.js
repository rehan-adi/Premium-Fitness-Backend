import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    required: true,
    type: String,
  },
});

const userModel = mongoose.model("gym_userModel", userSchema);

export default userModel;
