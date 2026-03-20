import dotenv from "dotenv";
dotenv.config();

/** @type {import("drizzle-kit").Config} */
module.exports = {
  schema: "./src/models",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL, 
  },
};
