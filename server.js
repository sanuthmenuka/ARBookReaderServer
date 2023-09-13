require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");

const userRoutes = require("./routes/user");

const app = express();

app.get("/", function (req, res) {
  res.send("Hello world!");
});

//middlware
app.use(express.json());

//routes
app.use("/api/user", userRoutes);

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
