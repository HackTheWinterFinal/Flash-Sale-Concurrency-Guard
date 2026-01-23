const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const checkAuth = require('../middleware/auth.middleware');

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Protected Routes
router.use(checkAuth);
const upload = require('../middleware/upload.middleware');

router.post('/', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'background', maxCount: 1 }
]), movieController.addMovie);
router.put('/:id', movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);
router.get('/company/mine', movieController.getCompanyMovies);


module.exports = router;
