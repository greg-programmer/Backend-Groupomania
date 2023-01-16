
//Importation express//
const express = require('express');
//Création d'un routeur//
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

//*****Route pour l'authentification************//

router.post('/signup', multer,userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/login/token',userCtrl.getToken);
router.get('/login/logout/:id',auth,userCtrl.logout)
router.get('/login/getusers',multer,userCtrl.getuser);
router.get('/login/getoneuser/:id',multer,userCtrl.getOneUser)
router.post('/user/upload/:id',multer,userCtrl.uploadImg);

module.exports = router;

