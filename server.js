const express = require("express");
const connectDB = require("./dataBase/mongodb");
require("dotenv").config();
const path = require("path");
connectDB();
const server = express();
const { cors } = require("./middleware/cors");
const port = process.env.PORT;

// MIDDLEWARES
server.use(cors);
server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use("/images", express.static(path.join(__dirname, "images")));

// ATTRIBUER LES ROUTES
server.use("/api/books", require("./routes/book"));
server.use("/api/auth", require("./routes/user"));

// LANCER LE SERVEUR
server.listen(port, () => console.log("~> Serveur lancé sur le port " + port));
