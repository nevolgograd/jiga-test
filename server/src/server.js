const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { connectDB } = require("./utils.js");

const app = express();

(async () => {
  try {
    dotenv.config();
    app.use(cors());
    app.use(express.json());

    await connectDB();

    app.use("/", routes);
    // app.get("/", (req, res) => {
    //   res.send("API is Alive!");
    // });

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (e) {
    console.error("Failed to start server:", e);
  }
})();
