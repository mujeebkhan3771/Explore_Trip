if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
//Authentication & Authoriz^n
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const { listingSchema, reviewSchema } = require("./schema.js");
// const Listing = require("./models/listing.js");
// const Review = require("./models/review.js");
// const wrapAsync = require("./utils/wrapAsync.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("Server is connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, //seconds
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE");
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //one week i.e 7days .it is in milli seconds . one second contains thousand milli second
  },
};

app.use(session(sessionOptions));
app.use(flash());

//Authentication & Authoriz^n
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "tsd-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.send("Hi . I am Mohammed Mujeeb Khan S, and I am currently pursuing my Bachelor's degree in Computer Science and Engineering with a specialization in Data Science (CSE-DS) at BITM college . As an undergraduate student, I am passionate about exploring the field of data science and developing strong technical and analytical skills to solve real-world problems. This project is designed as per innovation and design thinking (idt) which involves sequence of steps. [Empathy]: Designed considering real pain points of tourists like scattered information, language barriers, and lack of planning tools.
[Define]: Scoped the problem to help tourists explore Karnataka effectively with authentic data.
[Ideate]: Brainstormed a centralized digital solution with smart listings.
[Prototype]: Developed an intuitive web interface with dynamic data rendering.
[Test]: Tested project with students of the class.");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
