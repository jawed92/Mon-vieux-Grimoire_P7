const validator = require("validator");
const bcrypt = require("bcrypt");

exports.emailChecker = (req, res, next) => {
	const { email } = req.body;
	if (!validator.isEmail(email)) {
		return res
			.status(400)
			.json({ message: "Format de l'adresse email invalide" });
	}
	next();
};

exports.passwordCrypter = async (req, res, next) => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		req.body.password = hashedPassword;
		next();
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Une erreur s'est produite lors du hachage du mot de passe",
			error: error,
		});
	}
};
