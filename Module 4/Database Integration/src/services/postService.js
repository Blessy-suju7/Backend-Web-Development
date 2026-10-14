const postRepository = require('../repositories/postRepository');

async function listPosts() {
  return postRepository.findAll();
}

async function getPost(id) {
  return postRepository.findById(id);
}

async function createPost(fields) {
  if (!fields || !fields.title) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  if (!Number.isInteger(fields.authorId) || fields.authorId <= 0 || fields.authorId > 2147483647) {
    const error = new Error('Author must be a positive integer');
    error.statusCode = 422;
    throw error;
  }

  return postRepository.create({
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  });
}

async function updatePost(id, patch) {
  return postRepository.update(id, patch);
}

async function removePost(id) {
  return postRepository.remove(id);
}

module.exports = { listPosts, getPost, createPost, updatePost, removePost };
