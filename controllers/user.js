require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async (req, res) => {
	const { email, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ email, password: hashedPassword });
		await user.save();
		res.json({ message: "Utilisateur inscrit avec succès!" });
	} catch (error) {
		res.status(500).json({ message: "Erreur lors de l'inscription." });
	}
};

exports.login = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non trouvé !" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((valid) => {
					if (!valid) {
						return res.status(401).json({ error: "Mot de passe incorrect !" });
					}
					console.log("connect");
					const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
						expiresIn: "24h",
					});
					res.status(200).json({
						userId: user._id,
						token: token,
					});
					console.log("ok");
				})
				.catch((error) => {
					console.error(error);
					res.status(500).json({ error: "Erreur interne du serveur" });
				});
		})
		.catch((error) => {
			console.error(error);
			res.status(500).json({ error: "Erreur interne du serveur" });
		});
};
