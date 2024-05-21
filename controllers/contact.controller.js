import contactModel from "../models/contact.model.js";

const contact = async (req, res) => {
  try {
    const { username, email, phoneNumber, question } = req.body;

    if (!username || !email || !phoneNumber || !question) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    const newContact = new contactModel({
      username,
      email,
      phoneNumber,
      question,
    });
    await newContact.save();
    return res
      .status(200)
      .json({ success: true, message: "Your query send successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "failed to send query" });
  }
};

export default contact;
