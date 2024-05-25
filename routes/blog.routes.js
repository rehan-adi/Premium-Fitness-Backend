import express from 'express';
import { postBlog, getAllBlog } from '../controllers/blog.controllers.js'

const blogRouter = express.Router();


// post a blog
blogRouter.post("/postblog", postBlog)
// get all blogs
blogRouter.get("/getblog", getAllBlog)


export default blogRouter;