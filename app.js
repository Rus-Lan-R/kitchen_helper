const express = require("express");
const session = require("express-session");

const http = require("http");
const WebSocket = require("ws");

const MongoStore = require("connect-mongo");
const hbs = require("hbs");
const path = require("path");
require("dotenv").config();
const { connect, dbConnectionURL } = require("./src/config/db");
const { botListiner } = require("./src/bot/bot");

const indexRouter = require("./src/routes/index.routes");
const authRouter = require("./src/routes/auth.routes");
const chatRouter = require("./src/routes/chat.routes");

const app = express();

connect();
botListiner();

const map = new Map();

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

// if (process.env.DEV) {
// 	const morgan = require("morgan");
// 	app.use(morgan("dev"));
// }

app.use((req, res, next) => {
	if (req.session.user?.userName) {
		res.locals.userName = req.session.user.userName;
		res.locals.userId = req.session.user.id;
	}

	next();
});

const checkAuthUser = (req, res, next) => {
	console.log("check", req.session.user);
	if (!req.session?.user) res.redirect("/auth/signup");
	next();
};

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/chat", checkAuthUser, chatRouter);

const server = http.createServer(app);

const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on("upgrade", (request, socket, head) => {
	console.log("Parsing session from request...");

	sessionParser(request, {}, () => {
		if (!request.session.user?.id) {
			socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
			socket.destroy();
			return;
		}

		console.log("Session is parsed!");

		wss.handleUpgrade(request, socket, head, (ws) => {
			wss.emit("connection", ws, request);
		});
	});
});

wss.on("connection", (ws, request) => {
	const {
		user: { id, userName: name },
	} = request.session;

	map.set(id, ws);

	ws.on("message", (message) => {
		const parsedMessage = JSON.parse(message);

		switch (parsedMessage.type) {
			case "CHAT_CONNECT":
				map.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: parsedMessage.type,
								payload: `${name} присоединился к чату`,
							}),
						);
					}
				});
				break;

			case "CHAT_MESSAGE":
				map.forEach((client, key) => {
					if (client.readyState === WebSocket.OPEN) {
						client.send(
							JSON.stringify({
								type: parsedMessage.type,
								payload: {
									name,
									message: parsedMessage.payload,
									isIam: key === id,
								},
							}),
						);
					}
				});
				break;
			default:
				break;
		}

		console.log(`Received message ${message} from user ${id}`);
	});

	ws.on("close", () => {
		map.delete(id);
	});
});

server.listen(process.env.PORT, () => {
	console.log("Server has been started on port: ", process.env.PORT);
});

// app.listen(process.env.PORT || 3000, () => {
// 	console.log("Server has been started on port: ", PORT);
// });
