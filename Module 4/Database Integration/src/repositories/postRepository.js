const prisma = require('../lib/prisma');

function parseId(id) {
  const parsedId = Number(id);
  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
}

function handleDatabaseError(error) {
  if (error && error.code === 'P2002') {
    const conflict = new Error('A record with these values already exists');
    conflict.statusCode = 409;
    throw conflict;
  }

  if (error && error.code === 'P2003') {
    const conflict = new Error('The related record does not exist');
    conflict.statusCode = 409;
    throw conflict;
  }

  throw error;
}

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  const postId = parseId(id);
  if (postId === null) return null;
  return prisma.post.findUnique({ where: { id: postId } });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body || '',
        authorId: Number(fields.authorId),
      },
    });
  } catch (error) {
    handleDatabaseError(error);
  }
}

async function update(id, patch) {
  const postId = parseId(id);
  if (postId === null) return null;

  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  try {
    return await prisma.post.update({ where: { id: postId }, data });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

async function remove(id) {
  const postId = parseId(id);
  if (postId === null) return false;

  try {
    await prisma.post.delete({ where: { id: postId } });
    return true;
  } catch (error) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

module.exports = { findAll, findById, create, update, remove };
