const service = require('../services/postService');

const http = require('../utils/http');

function listPosts(req, res) {
  const rows = service.listPosts(req.query);

  return http.sendList(res, rows, req.query);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);

  if (!post) {
    return http.sendError(res, 404, {
      code: 'NOT_FOUND',
      message: 'Post not found'
    });
  }

  return http.sendOk(res, post);
}

function createPost(req, res) {
  const post = service.createPost(req.body);

  return http.sendCreated(res, post);
}

function likePost(req, res) {
  try {
    const post = service.likePost(req.params.id);

    return http.sendCreated(res, {
      id: post.id,
      likes: post.likes
    });
  } catch (err) {
    if (err.statusCode === 404) {
      return http.sendError(res, 404, {
        code: 'NOT_FOUND',
        message: 'Post not found'
      });
    }

    return http.sendError(res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    });
  }
}

function explode(req, res) {
  try {
    service.explode();
  } catch (err) {
    return http.sendError(res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    });
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};