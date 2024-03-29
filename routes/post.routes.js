const router = require('express').Router();
const postController = require("../controllers/post.controller");
const multer = require('multer');
const storage = multer.memoryStorage(); // Stocke le fichier en mémoire
const upload = multer({ storage: storage });



router.post("/", upload.single('file'), postController.createPost);
router.get("/", postController.readPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
router.patch("/like-post/:id", postController.likePost);
router.patch("/unlike-post/:id", postController.unlikePost);

// commentaire 
router.patch("/comment-post/:id", postController.commentPost);
router.patch("/edit-comment-post/:id", postController.editCommentPost);
router.patch("/delete-comment-post/:id", postController.deleteCommentPost);



module.exports = router;
