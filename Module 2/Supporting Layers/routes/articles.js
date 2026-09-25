/**
 * Articles router.
 *
 * Validation chains live in validators/.
 * Validation result handling lives in utils/.
 * Async controller errors are forwarded by asyncHandler.
 */

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/articlesController');

const {
  createArticle,
  updateArticle,
} = require('../validators/article.validator');

const validateRequest = require('../utils/validateRequest');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(ctrl.list));

router.post(
  '/',
  createArticle,
  validateRequest,
  asyncHandler(ctrl.create)
);

router.patch(
  '/:id',
  updateArticle,
  validateRequest,
  asyncHandler(ctrl.update)
);

module.exports = router;