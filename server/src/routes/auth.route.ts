import { Router } from "express";
import {  login, logout, register } from "../controller/user.controller";
import { protectRoutes } from "../middleware/protectRoutes";

const router = Router(); 

router.post("/register", register); 
router.post("/login", login);
router.post("/logout",logout);
// router.post("/addBio",protectRoutes,addBio);
export default router;