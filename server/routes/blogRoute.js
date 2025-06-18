import express from "express";
import {
  addBlog,
  addComment,
  deleteBlogById,
  generateContent,
  getAllBlogs,
  getBlogById,
  getBlogComments,
  togglePublish,
} from "../controllers/blogController.js";
import upload from "../middlewares/multer.js";
import auth from "../middlewares/auth.js";

const blogRouter = express.Router();

blogRouter.post("/add", upload.single("image"), addBlog); //auth
blogRouter.get("/all", getAllBlogs);
blogRouter.get("/:blogId", getBlogById);
blogRouter.post("/delete", deleteBlogById); //auth
blogRouter.post("/toggle-publish", togglePublish); //auth

blogRouter.post("/add-comment", addComment);
blogRouter.post("/comments/:blogId", getBlogComments);

blogRouter.post("/generate", generateContent);

export default blogRouter;
