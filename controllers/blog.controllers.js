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

const getAllBlog = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const skip = (page - 1) * limit;

  try {
    const blogs = await blogModel.find().skip(skip).limit(limit);
    const totalBlogs = await blogModel.countDocuments();
    return res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        total: totalBlogs,
        page,
        limit,
        totalPages: Math.ceil(totalBlogs / limit),
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get all blogs" });
  }
};

export { postBlog, getAllBlog };
