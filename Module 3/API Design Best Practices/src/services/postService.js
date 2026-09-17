const store = require('../data/postStore');

function listPosts(query = {}) {
  return store.getAllPosts();
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  return store.createPost({
    title: body.title,
    author: body.author
  });
}

function likePost(id) {
  const post = store.incrementLikes(id);

  if (!post) {
    const err = new Error('Post not found');
    err.statusCode = 404;
    throw err;
  }

  return post;
}

function explode() {
  const err = new Error('Internal failure');
  err.statusCode = 500;
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};