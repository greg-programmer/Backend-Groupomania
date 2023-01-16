
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config');
const stuffCtrl = require('../controllers/Post');

router.get('/:id', auth, multer,stuffCtrl.onePost);
router.post('/:id',auth,multer, stuffCtrl.postMessage);
router.put('/:id', auth, multer, stuffCtrl.updatePost);
router.get('/',multer,stuffCtrl.getMessages);
router.post('/:id/like', multer, stuffCtrl.postLikeDislike);
router.delete('/:id', auth, stuffCtrl.deletePost);

module.exports = router;
