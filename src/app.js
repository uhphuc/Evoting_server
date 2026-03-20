import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { generateKeys } from "./libs/paillierKeys.js";

import keyRoutes from "./routes/keyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import optionRoutes from "./routes/optionRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import announRoutes from "./routes/announRoutes.js";
import http from "http";


const app = express();
const server = http.createServer(app);

import { initSocket } from "../socket.js";



// Middleware
app.use(cors());
app.use(express.json());




// Routes
app.use("/keys", keyRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/options", optionRoutes);
app.use("/votes", voteRoutes);
app.use("/announcements", announRoutes);



const PORT = process.env.PORT || 3000;
generateKeys().then(() => {
  
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    initSocket(server);
  });
