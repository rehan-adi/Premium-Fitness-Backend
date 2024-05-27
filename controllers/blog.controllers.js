import blogModel from "../models/blog.model.js";

const postBlog = async (req, res) => {
  try {
    const { heading, description, link } = req.body;
    const { image } = req.file;

    if (!image || !heading || !description || !link) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }
    await blogModel.create({
      image: image.path,
      heading,
      description,
      link,
    });
    return res
      .status(200)
      .json({ success: true, message: "Blog created successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create blog" });
  }
};

const getAllBlog = async(req, res) => {
  try {
      const blogs = await blogModel.find();
      return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get all blogs" });
  }
};

export { postBlog, getAllBlog };
