require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");

const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/Book");
const cookieParser = require("cookie-parser");

const app = express();

app.get("/", function (req, res) {
  res.send("Hello world!");
});

//middlware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(process.env.PORT, function () {
      console.log("Connected to db and  listening on port ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
