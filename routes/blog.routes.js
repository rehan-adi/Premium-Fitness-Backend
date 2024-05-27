import express from 'express';
import upload from '../utils/multer.js' 
import { postBlog, getAllBlog } from '../controllers/blog.controllers.js'

const blogRouter = express.Router();

// post a blog
blogRouter.post("/postblog", upload.single('image'), postBlog)
// get all blogs
blogRouter.get("/getblog", getAllBlog)


export default blogRouter;