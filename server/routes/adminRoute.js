import express from "express";
import {
  adminLogin,
  approveCommentById,
  deleteCommentById,
  getAllBlogsAdmin,
  getAllComments,
  getDashboard,
} from "../controllers/adminController.js";
import auth from "../middlewares/auth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/comments", getAllComments); //auth
adminRouter.get("/blogs", getAllBlogsAdmin); //AUTH
adminRouter.post("/delete-comment", deleteCommentById); //auth
adminRouter.post("/approve-comment", approveCommentById); //auth
adminRouter.get("/dashboard", getDashboard); //auth

export default adminRouter;
