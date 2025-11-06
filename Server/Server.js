import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import connectDB from "./DB/Database.js";
const PORT=process.env.PORT || 5000
import cookieParser from "cookie-parser";
import UserAuthrouter from "./Router/UserAuth.Router.js";
import UserDatarouter from "./Router/userData.Router.js";
import Evaluationrouter from "./Router/evaluation.routes.js";
connectDB();
const app = express();
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  credentials: true, // if using cookies or auth headers
}));
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth',UserAuthrouter)
app.use('/api/user',UserDatarouter)
app.use('/api/evaluation',Evaluationrouter)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
