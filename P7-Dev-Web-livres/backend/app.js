// const express = require("express");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");

// require("dotenv").config();

// const bookRoutes = require("./routes/book");
// const userRoutes = require("./routes/user");
// const path = require("path");

// mongoose
// 	.connect(
// 		"mongodb+srv://jawed01:jawed92@cluster0.yezr1eh.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp",
// 		{ useNewUrlParser: true, useUnifiedTopology: true }
// 	)
// 	.then(() => console.log("Connexion à MongoDB réussie !"))
// 	.catch(() => console.log("Connexion à MongoDB échouée !"));

// const app = express();

// app.use((req, res, next) => {
// 	res.setHeader("Access-Control-Allow-Origin", "*");
// 	res.setHeader(
// 		"Access-Control-Allow-Headers",
// 		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
// 	);
// 	res.setHeader(
// 		"Access-Control-Allow-Methods",
// 		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
// 	);
// 	next();
// });

// app.use(bodyParser.json());

// app.use("/api/auth", userRoutes);
// app.use("/api/books", bookRoutes);
// app.use("/images", express.static(path.join(__dirname, "images")));

// module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
const path = require("path");

mongoose
	.connect(
		"mongodb+srv://jawed01:jawed92@cluster0.yezr1eh.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp",
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(() => console.log("Connexion à MongoDB réussie !"))
	.catch(() => console.log("Connexion à MongoDB échouée !"));

const app = express();

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Remplacez par l'URL de votre frontend
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, PATCH, OPTIONS"
	);
	next();
});

app.use(bodyParser.json());

app.use("/api/auth", userRoutes); // Vous pouvez ajuster l'URL ici si nécessaire
app.use("/api/books", bookRoutes); // Vous pouvez ajuster l'URL ici si nécessaire
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
