const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const bookCtrl = require("../controllers/book");

router.get("/", auth, bookCtrl.getAllBook);
router.post("/", auth, multer, bookCtrl.createThing);
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.get("/:id", bookCtrl.getOneThing);
router.put("/:id", multer, bookCtrl.modifyThing);
router.delete("/:id", bookCtrl.deleteThing);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const multer = require("../middleware/multer-config");
// const bookCtrl = require("../controllers/book");

// // Obtenir la liste des livres
// router.get("/", auth, bookCtrl.getAllBook);

// // Obtenir un livre par ID
// router.get("/:id", auth, bookCtrl.getBook);

// // Obtenir les livres les mieux notés
// router.get("/bestrating", bookCtrl.getBestRatedBooks);

// // Supprimer un livre
// router.delete("/:id", auth, bookCtrl.deleteThing);

// // Ajouter une note à un livre
// router.post("/:id/rating", auth, bookCtrl.rateBook);

// // Ajouter un nouveau livre
// router.post("/", auth, multer, bookCtrl.createThing);

// // Mettre à jour un livre
// router.put("/:id", auth, multer, bookCtrl.modifyThing);

// module.exports = router;
