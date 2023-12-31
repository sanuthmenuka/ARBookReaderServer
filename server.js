require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
var cors = require("cors");

const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/Book");
const publisherrightRoutes = require("./routes/Publisherright");
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({ origin: "https://bookmarketplace.onrender.com", credentials: true })
);
const stripe = require("stripe")(
  "sk_test_51O12iqAQvidGp1QOJDPSU2UlOCAjNtA8CPjbH4X6RssKvOKxLCuuflXvlHfLEWXBg4U4UIIL4Wypv74pFmrFDGXQ00qNuRF96x"
);

app.get("/", function (req, res) {
  res.send("Hello world!");
});

//middlware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/publisherright", publisherrightRoutes);

app.post("/create-subscription", async (req, res) => {
  const customer = await stripe.customers.create({
    email: req.body.email,
    source: req.body.stripeToken,
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: req.body.plan }],
  });

  res.json({ subscription });
});

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
