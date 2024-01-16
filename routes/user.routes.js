const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

// authentification 
router.post("/register", authController.signUp);

// 
router.get('/', userController.getAllUsers);
router.get('/:id', userController.userInfo);


module.exports = router;
