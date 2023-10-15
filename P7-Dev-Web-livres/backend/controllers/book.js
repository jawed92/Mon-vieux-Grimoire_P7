const Thing = require("../models/Thing");
const User = require("../models/User");
const fs = require("fs");

exports.createBook = (req, res, next) => {
	try {
		// Assurez-vous que les données sont correctement extraites du corps de la requête
		const { title, author, year, genre, ratings } = req.body;

		// Vérifiez que toutes les données requises sont présentes
		if (!title || !author || !year || !genre || !ratings) {
			return res.status(400).json({ error: "Données manquantes" });
		}

		// Calculez la note moyenne à partir des notations
		let ratingFinal = 0;
		ratings.forEach(function (ratingObject) {
			ratingFinal += ratingObject.grade;
		});
		ratingFinal /= ratings.length;
		console.log("ratings:", ratings, "ratingFinal:", ratingFinal);

		// Obtenez l'ID de l'utilisateur à partir du token d'authentification
		const userId = req.auth.userId;

		// Créez un nouvel objet Thing à partir des données
		const thing = new Thing({
			title,
			author,
			year,
			genre,
			ratings,
			averageRating: ratingFinal, // Assurez-vous d'enregistrer la note moyenne correctement
			userId, // Assurez-vous que l'ID de l'utilisateur est correctement attribué
			imageUrl: req.file
				? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
				: null,
		});

		// Enregistrez l'objet Thing dans la base de données
		thing
			.save()
			.then(() => {
				res.status(201).json({ message: "Livre enregistré avec succès !" });
			})
			.catch((error) => {
				res.status(400).json({ error });
			});
	} catch (error) {
		res.status(500).json({ error });
	}
};

exports.getBook = (req, res, next) => {
	Thing.findOne({
		_id: req.params.id,
	})
		.then((thing) => {
			res.status(200).json(thing);
		})
		.catch((error) => {
			res.status(404).json({
				error: error,
			});
		});
};

exports.rateBook = (req, res, next) => {
	const bookId = req.params.id; // ID du livre à noter
	const { grade } = req.body; // Note attribuée

	// Vérifiez que la note est valide (par exemple, entre 1 et 5)
	if (grade < 1 || grade > 5) {
		return res.status(400).json({ error: "La note doit être entre 1 et 5." });
	}

	// Vous devrez ajouter la logique pour ajouter la note au livre spécifié par ID
	// Assurez-vous de mettre à jour la moyenne de notation du livre

	// Exemple de logique (à personnaliser en fonction de votre modèle de données) :
	Book.findById(bookId)
		.then((book) => {
			if (!book) {
				return res.status(404).json({ error: "Livre non trouvé." });
			}

			// Ajoutez la note au livre et mettez à jour la moyenne
			book.ratings.push({ userId: req.auth.userId, grade });
			const totalRating = book.ratings.reduce(
				(sum, rating) => sum + rating.grade,
				0
			);
			book.averageRating = totalRating / book.ratings.length;

			// Enregistrez le livre mis à jour dans la base de données
			return book.save();
		})
		.then(() => {
			res.status(200).json({ message: "Note ajoutée avec succès." });
		})
		.catch((error) => {
			res.status(500).json({ error: "Erreur lors de l'ajout de la note." });
		});
};

exports.updateBook = (req, res, next) => {
	const thingObject = req.file
		? {
				...JSON.parse(req.body.thing),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	delete thingObject._userId;
	Thing.findOne({ _id: req.params.id })
		.then((thing) => {
			if (thing.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				Thing.updateOne(
					{ _id: req.params.id },
					{ ...thingObject, _id: req.params.id }
				)
					.then(() => res.status(200).json({ message: "Objet modifié!" }))
					.catch((error) => res.status(401).json({ error }));
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.deleteBook = (req, res, next) => {
	const thingId = req.params.id;
	console.log("Thing ID:", thingId);

	// Rechercher l'objet dans la base de données
	Thing.findOne({ _id: thingId })
		.then((thing) => {
			console.log("Thing trouvé dans la base de données :", thing);

			// Vérifiez si l'objet thing existe
			if (thing === null || thing === undefined) {
				console.log("Objet non trouvé dans la base de données.");
				return res.status(404).json({ message: "Objet non trouvé." });
			}

			// Convertir thing en un objet JavaScript plain (POJO)
			const thingData = thing.toObject();

			console.log("Objet trouvé dans la base de données:", thingData);
			console.log("req.auth.userId :", req.auth.userId);

			if (!thingData.userId) {
				console.log("Erreur: L'objet n'a pas de propriété 'userId'.");
				return res
					.status(404)
					.json({ message: "Propriété 'userId' manquante." });
			}

			if (req.auth.userId !== thingData.userId) {
				console.log("Utilisateur non autorisé à supprimer l'objet.");
				return res.status(401).json({ message: "Non autorisé." });
			}

			const filename = thing.imageUrl.split("/images/")[1];
			console.log("Nom du fichier image à supprimer:", filename);

			// Supprimer le fichier image
			fs.unlink(`images/${filename}`, (error) => {
				if (error) {
					console.error(
						"Erreur lors de la suppression du fichier image:",
						error
					);
					return res
						.status(500)
						.json({ error: "Erreur lors de la suppression du fichier image." });
				}

				console.log("Fichier image supprimé avec succès.");

				// Supprimer l'objet de la base de données
				Thing.deleteOne({ _id: thingId })
					.then(() => {
						console.log("Objet supprimé avec succès.");
						res.status(200).json({ message: "Objet supprimé !" });
					})
					.catch((error) => {
						console.error("Erreur lors de la suppression de l'objet:", error);
						res
							.status(500)
							.json({ error: "Erreur lors de la suppression de l'objet." });
					});
			});
		})
		.catch((error) => {
			console.error("Erreur lors de la recherche de l'objet:", error);
			res
				.status(500)
				.json({ error: "Erreur lors de la recherche de l'objet." });
		});
};

exports.getAllBook = (req, res, next) => {
	Thing.find()

		.then((things) => {
			res.status(200).json(things);
		})
		.catch((error) => {
			res.status(400).json({
				error: error,
			});
		});
};

exports.getBestRatedBooks = async (req, res, next) => {
	try {
		// Récupérez tous les livres de votre base de données
		const things = await Thing.find();

		// Filtrer les livres déjà notés par l'utilisateur actuel
		const userId = req.auth.userId; // Obtenez l'ID de l'utilisateur actuel depuis le token d'authentification

		// Récupérez les notations de l'utilisateur actuel
		const user = await User.findById(userId).populate("ratings.book");

		if (!user) {
			return res.status(404).json({ error: "Utilisateur non trouvé." });
		}

		const userRatedBooks = user.ratings.map((rating) => rating.book);

		// Triez les livres par note moyenne, excluant ceux déjà notés par l'utilisateur
		const sortedBooks = things
			.filter((thing) => !userRatedBooks.includes(thing))
			.sort((a, b) => b.averageRating - a.averageRating);

		// Renvoyez les n premiers livres les mieux notés
		const n = 10; // Vous pouvez ajuster n selon le nombre de livres que vous souhaitez renvoyer

		const bestRatedBooks = sortedBooks.slice(0, n);

		res.status(200).json(bestRatedBooks);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des livres les mieux notés :",
			error
		);
		res.status(500).json({
			error: "Erreur lors de la récupération des livres les mieux notés.",
		});
	}
};
