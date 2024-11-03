import { Response, Request } from "express";

import { Router } from "express";
import { createAuction, deleteAuction, getAllAuctions, getAllAuctionsById, getBidsForAuction, getUserBids, placeBid } from "../controller/auction.controller";
import { protectRoutes } from "../middleware/protectRoutes";
 
const router = Router();
router.post("/create",protectRoutes,createAuction)
router.get("/allAuctions",protectRoutes,getAllAuctions)
router.get("/auctionById/:id",protectRoutes,getAllAuctionsById)
router.get("/delete/:id",protectRoutes,deleteAuction)

router.post("/placeBid/:id", protectRoutes, placeBid);
router.get("/bids/:id", protectRoutes, getBidsForAuction);
router.get("/userBids", protectRoutes, getUserBids);
export default router;