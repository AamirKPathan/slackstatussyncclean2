import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Mount OAuth routes
import oauthRoutes from "./routes/oauth.js";
app.use("/oauth", oauthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});