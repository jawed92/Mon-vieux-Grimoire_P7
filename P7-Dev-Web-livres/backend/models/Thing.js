const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema({
	userId: { type: String, required: true },
	grade: { type: Number, required: true },
});

const bookSchema = mongoose.Schema({
	userId: { type: String, required: true },
	title: { type: String, required: true },
	author: { type: String, required: true },
	imageUrl: { type: String, required: true },
	year: { type: Number, required: true },
	genre: { type: String, required: true },
	ratings: [ratingSchema],
	averageRating: { type: Number, default: 0 },
});

// Middleware pour mettre à jour la note moyenne lors de l'ajout ou de la modification d'une note
bookSchema.pre("save", function (next) {
	if (this.ratings && this.ratings.length > 0) {
		const totalRating = this.ratings.reduce(
			(sum, rating) => sum + rating.grade,
			0
		);
		this.averageRating = totalRating / this.ratings.length;
	} else {
		this.averageRating = 0;
	}
	next();
});

module.exports = mongoose.model("Book", bookSchema);
