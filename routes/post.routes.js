const router = require('express').Router();
const postController = require("../controllers/post.controller");

router.post("/", postController. createPost);
router.get("/", postController. readPost);
router.put("/:id", postController. updatePost);
router.delete("/:id", postController. deletePost);

module.exports = router;
