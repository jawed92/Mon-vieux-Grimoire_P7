const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		mongoose.set("strictQuery", false);
		await mongoose.connect(process.env.DB_URI);
		console.log("~> Serveur connecté à MongoDB");
	} catch (err) {
		console.log(err);
		process.exit();
	}
};

module.exports = connectDB;
