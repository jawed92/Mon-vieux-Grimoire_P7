const bcrypt = require("bcrypt");
const UserModel = require("../models/user");
const { tokenMaker } = require("../middleware/auth");

// CREER UN UTILISATEUR
module.exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    // VERIFIER SI L'UTILISATEUR EXISTE DEJA DANS LA BASE DE DONNE
    const checkedUserMail = await UserModel.findOne({ email });
    if (checkedUserMail) {
      return res
        .status(400)
        .json({ message: "Cette adresse mail est déjà utilisée !" });
    }
    // CREER UN UTILISATEUR
    const newUser = new UserModel({ email, password });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    // GESTION DES ERREURS
    console.error(err);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la création de votre compte",
      err: err,
    });
  }
};

// CONNECTER UN UTILISATEUR
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // VERIFIER L'EXISTENCE DE L'UTILISATEUR DANS LA DB
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "email / mdp incorrects" });
    }
    // VERIFIER SI LE MOT DE PASSE EST CORRECT
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "email / mdp incorrects" });
    }
    // GENERER LE TOKEN
    const token = tokenMaker(user._id);
    res.status(200).json({
      userId: user._id,
      token: token,
    });
  } catch (err) {
    // GESTION DES ERREURS
    console.error(err);
    res.status(500).json({
      message: "Une erreur s'est produite lors de votre tentative de connexion",
      err: err,
    });
  }
};
