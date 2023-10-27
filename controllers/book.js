const Book = require("../models/Book");
const { imageEraser } = require("../middleware/imageEraser");

// OBTENIR LES BOOKS
module.exports.getAllBook = async (req, res) => {
	try {
		const books = await Book.find();
		// VERIFIER QUE LES BOOKS ONT ETE TROUVE
		if (!books) {
			res.status(400).json({ message: "Problême d'acquisition de la DB" });
		}
		// SI LA LISTE NE CONTIENT PAS DE BOOK
		if (books.length === 0) {
			res
				.status(204)
				.json({ message: "la DB ne possède pour l'instant aucun livres" });
		} else {
			// ENVOI VERS LE FRONT DE LA LISTE DE BOOK
			res.status(200).json(books);
		}
		// GESTION DES ERREURS
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Une erreur s'est produite lors de la récupération des livres",
			err: err,
		});
	}
};

// OBTENIR UN BOOK
module.exports.getBook = async (req, res) => {
	try {
		const book = await Book.findById(req.params.id);
		// VERIFIER QUE LE BOOK EST TROUVE
		if (!book) {
			res.status(404).json({ message: "aucun livre ne correspond à cet id" });
		} else {
			// ENVOI AU FRONT LE BOOK TROUVE
			res.status(200).json(book);
		}
		// GESTION DES ERREURS
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Une erreur s'est produite lors de la récupération du livre",
			err: err,
		});
	}
};

// OBTENIR LES 3 MEILLEURS BOOKS
module.exports.getBestBooks = async (req, res) => {
	try {
		// TROUVER LES 3 BOOKS LES MIEUX NOTES
		const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
		// ENVOIR AU FRONT DU CLASSEMENT
		res.status(200).json(bestBooks);
		// GESTION DES ERREURS
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Une erreur s'est produite lors de la récupération du livre",
			err: err,
		});
	}
};

// CREATION D'UN BOOK
module.exports.createBook = async (req, res) => {
	try {
		// VERIFICATION DE LA PRESENCE D'UN CONTENU
		if (!req.body) {
			return res
				.status(400)
				.json({ message: "Votre requête ne contient aucun livre" });
		}
		// EXTRACTION DES DONNEES DU FORMDATA
		const bookData = JSON.parse(req.body.book);
		const { userId, title, author, year, genre, ratings } = bookData;
		let imageUrl = "";
		// STOCKAGE DE L'URL DE L'IMAGE
		if (req.file) {
			imageUrl = `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}`;
		}
		// CREATION D'UN NOUVEAU BOOK
		const newBook = new Book({
			userId,
			title,
			author,
			year,
			genre,
			imageUrl,
			ratings,
		});
		// CALCULER AVERAGERATING
		const grades = newBook.ratings.map((rating) => rating.grade);
		const average =
			grades.reduce((total, grade) => total + grade, 0) / grades.length;
		newBook.averageRating = parseFloat(average.toFixed(1));
		// ENVOI DU NOUVEAU BOOK DANS LA DB
		const createdBook = await newBook.save();
		res
			.status(201)
			.json({ message: "Nouveau livre enregistré", book: createdBook });
		// GESTION DES ERREURS
	} catch (err) {
		res.status(500).json({
			message: "Une erreur s'est produite lors de la création du livre",
			err: err,
		});
	}
};

// MODIFIER UN BOOK
module.exports.updateBook = async (req, res) => {
	try {
		req.body.book = JSON.parse(req.body.book) //conversion en json manuellement body.book= string??todo
		const bookId = req.params.id;
		const book = await Book.findById(bookId);
		// VERIFIER SI LE BOOK EST TROUVE
		if (!book) {
			return res.status(404).json({ message: "Livre introuvable" });
		}
		// EXTRACTION DES DONNEES DU BODY
		const { userId, title, author, year, genre } = req.body.book;
		let imageUrl = book.imageUrl;
		// STOCKAGE DE L'URL DE L'IMAGE
		if (req.file) {
			imageEraser(imageUrl);
			imageUrl = `${req.protocol}://${req.get("host")}/images/${
				req.file.filename
			}`;
		}
		// MISE A JOUR DU BOOK
		book.userId = userId;
		book.title = title;
		book.author = author;
		book.year = year;
		book.genre = genre;
		book.imageUrl = imageUrl;
		// ENVOI DU BOOK ACTUALISE DANS LA DB
		await Book.findByIdAndUpdate(bookId, book);
		console.log(title);
		res.status(200).json({
			message: "Livre mis à jour",
			book: book,
		});
		// GESTION DES ERREURS
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "Une erreur s'est produite lors de la mise à jour du livre",
			err: err,
		});
	}
};

// SUPPRIMER UN BOOK
module.exports.deleteBook = async (req, res) => {
	try {
		const bookToDelete = await Book.findById(req.params.id);
		// VERIFIER QUE LE BOOK A SUPPRIMER EXISTE
		if (!bookToDelete) {
			console.log("livre pas trouvé");
		} else {
			// SUPPRESSION DU BOOK ET DE L'IMAGE ASSOCIEE
			await Book.findOneAndRemove({ _id: req.params.id });
			imageEraser(bookToDelete.imageUrl);
			res.status(202).json({ message: "livre supprimé" });
		}
		// GESTION DES ERREURS
	} catch (err) {
		// GESTION DES ERREURS
		console.error(err);
		res.status(500).json({
			error: "Une erreur est survenue lors de la suppression du livre",
		});
	}
};

// NOTER UN BOOK
module.exports.rateBook = async (req, res) => {
	try {
		// VERIFIER QUE LE BODY CONTIENT UNE DATA
		if (!req.body) {
			return res
				.status(400)
				.json({ message: "Votre requête ne contient aucune note" });
		}
		// EXTRAIRE LES DATA
		const { userId, rating } = req.body;
		const bookToRate = await Book.findById(req.params.id); //id represente id du livre dans la requete (route book)
		// VERIFIER SI L'UTILISATEUR A DEJA NOTE LE BOOK
		if (
			bookToRate.ratings.some((rating) => {
				return rating.userId === userId;
			})
		) {
			res.status(400).json({ message: "Vous avez déjà noté ce livre" });
		}
		// AJOUTER LA NOUVELLE NOTE
		bookToRate.ratings.push({ userId: userId, grade: rating });
		// CALCULER AVERAGERATING
		const grades = bookToRate.ratings.map((rating) => rating.grade);
		const average =
			grades.reduce((total, grade) => total + grade, 0) / grades.length;
		bookToRate.averageRating = parseFloat(average.toFixed(1));
		// ACTUALISATION DU BOOK DANS LA DB
		await bookToRate.save();
		res.status(200).json(bookToRate);
	} catch (err) {
		// GESTION DES ERREURS
		console.error(err);
		res.status(500).json({
			error: "Une erreur est survenue lors de la mise à jour de la note",
		});
	}
};
