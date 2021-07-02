const express = require("express");
const session = require("express-session");

const MongoStore = require("connect-mongo");
const hbs = require("hbs");
const path = require("path");
require("dotenv").config();
const { connect, dbConnectionURL } = require("./src/config/db");
const { botListiner } = require("./src/bot/bot");

const indexRouter = require("./src/routes/index.routes");
const authRouter = require("./src/routes/auth.routes.js");

const app = express();
const PORT = process.env.PORT;

connect();
botListiner();

const sessionParser = session({
	secret: process.env.SESSION_SECRET,
	name: app.get("cookieName"),
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({ mongoUrl: dbConnectionURL }),
	cookie: {
		httpOnly: true,
	},
});

app.set("view engine", "hbs");
app.set("views", path.join(process.env.PWD, "src", "views"));
app.set("trust proxy", 1); // trust first proxy
app.set("cookieName", "sid");

hbs.registerPartials(path.join(process.env.PWD, "src", "views", "partials"));

hbs.registerHelper("createButton", (subscribers, userId) => {
	if (!userId) {
		return new hbs.SafeString(
			`<button type="button" class="btn btn-secondary btn-lg" disabled>SUBSCRIBE</button>`,
		);
	}
	if (subscribers.find((el) => el == userId)) {
		return new hbs.SafeString(`<button type="button" class="btn btn-danger">UNSUBSCRIBE</button>`);
	} else {
		return new hbs.SafeString(`<button type="button" class="btn btn-primary">SUBSCRIBE</button>`);
	}
});

app.use(express.static(path.join(process.env.PWD, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionParser);

if (process.env.DEV) {
	const morgan = require("morgan");
	app.use(morgan("dev"));
}

app.use((req, res, next) => {
	if (req.session.user?.userName) {
		res.locals.userName = req.session.user.userName;
		res.locals.userId = req.session.user.id;
	}

	next();
});

// const checkAuthUser = (req, res, next) => {
// 	console.log("check", req.session.user);
// 	if (!req.session?.user) res.redirect("/auth/signup");
// 	next();
// };

app.use("/", indexRouter);
app.use("/auth", authRouter);

app.listen(PORT || 3000, () => {
	console.log("Server has been started on port: ", PORT);
});
