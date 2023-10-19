const multer = require("multer");

const MIME_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "images");
	},
	filename: (req, file, callback) => {
		const name = file.originalname.split(" ").join("_");
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + Date.now() + "." + extension);
	},
});

const upload = multer({ storage: storage }).single("image");

// UPLOADER L'IMAGE
const imageUploader = (req, res, next) => {
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			return res.status(400).json({
				message: "Une erreur est survenue lors de l'upload du fichier.",
			});
		} else if (err) {
			return res.status(400).json({
				message: "Une erreur est survenue lors de l'upload du fichier.",
			});
		}
		next();
	});
};

module.exports = {
	imageUploader,
};
