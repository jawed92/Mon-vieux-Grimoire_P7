const fs = require("fs");
const path = require("path");

module.exports.imageEraser = (imageUrl) => {
	const imageName = imageUrl.split("/").pop();
	const imagePath = path.join(__dirname, "..", "images", imageName);

	fs.unlink(imagePath, (err) => {
		if (err) {
			console.error(err);
			return;
		}

		console.log(`${imageName} a été supprimé avec succès.`);
	});
};
