import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route";
import dotenv from "dotenv";
import auctionRoute from "./routes/auctiton.route";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());



app.use("/api/auth",authRoute)
app.use("/api/auction",auctionRoute)

app.listen(3000, () => {
	console.log("Server is running on port 3000");
}); 