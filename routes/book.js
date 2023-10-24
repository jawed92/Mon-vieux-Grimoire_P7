const express = require("express");
const router = express.Router();
const { tokenChecker } = require("../middleware/auth");
const { imageUploader, imageResizer } = require("../middleware/multer-config");
const {
	getAllBook,
	getBook,
	getBestBooks,
	createBook,
	updateBook,
	deleteBook,
	rateBook,
} = require("../controllers/book");

router.get("/", getAllBook);
router.get("/bestrating", getBestBooks);
router.get("/:id", getBook);
router.post("/", tokenChecker, imageUploader, imageResizer, createBook);
router.put("/:id", tokenChecker, imageUploader, imageResizer, updateBook);
router.delete("/:id", tokenChecker, deleteBook);
router.post("/:id/rating", tokenChecker, rateBook);

module.exports = router;
