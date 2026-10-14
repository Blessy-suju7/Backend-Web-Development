const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

async function findMissingUserId() {
  const lastUser = await prisma.user.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });

  if (!lastUser || lastUser.id < 2147483647) return (lastUser?.id || 0) + 1;

  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: { id: true },
  });
  let candidate = 1;
  for (const user of users) {
    if (user.id !== candidate) return candidate;
    candidate += 1;
  }
  if (candidate <= 2147483647) return candidate;

  throw new Error('No unused PostgreSQL user ID is available for verification');
}

async function main() {
  const author = await prisma.user.create({
    data: { name: `API verification ${randomUUID()}` },
  });
  let server;

  try {
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    async function request(path, method = 'GET', body) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = response.status === 204 ? null : await response.json();
      return { response, data };
    }

    const list = await request('/posts');
    assert.equal(list.response.status, 200);
    assert.ok(Array.isArray(list.data.data));

    assert.equal((await request('/posts/not-an-id')).response.status, 404);

    const created = await request('/posts', 'POST', {
      title: 'API verification post',
      body: 'Temporary integration-check record',
      authorId: author.id,
    });
    assert.equal(created.response.status, 201);
    assert.equal(created.data.data.authorId, author.id);
    const postId = created.data.data.id;

    const updatedList = await request('/posts');
    assert.equal(updatedList.response.status, 200);
    assert.ok(updatedList.data.data.some((post) => post.id === postId));

    const missingId = await findMissingPostId();
    assert.notEqual(missingId, postId);
    assert.equal((await request(`/posts/${missingId}`)).response.status, 404);

    const read = await request(`/posts/${postId}`);
    assert.equal(read.response.status, 200);
    assert.equal(read.data.data.id, postId);

    const updated = await request(`/posts/${postId}`, 'PATCH', {
      title: 'Updated API verification post',
    });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.data.data.title, 'Updated API verification post');

    assert.equal((await request(`/posts/${missingId}`, 'PATCH', { title: 'Missing' })).response.status, 404);
    assert.equal((await request(`/posts/${missingId}`, 'DELETE')).response.status, 404);
    assert.equal((await request(`/posts/${postId}`, 'DELETE')).response.status, 204);
    assert.equal((await request(`/posts/${postId}`)).response.status, 404);

    const missingTitle = await request('/posts', 'POST', { authorId: author.id });
    assert.equal(missingTitle.response.status, 422);
    assert.equal(missingTitle.data.error, 'Title is required');

    for (const invalidAuthorId of [undefined, null, '', 0, -1, 1.5, '1', 'not-an-id', 2147483648]) {
      const body = { title: 'Invalid author verification' };
      if (invalidAuthorId !== undefined) body.authorId = invalidAuthorId;
      const invalid = await request('/posts', 'POST', body);
      assert.equal(invalid.response.status, 422);
      assert.equal(invalid.data.error, 'Author must be a positive integer');
    }

    const relationFailure = await request('/posts', 'POST', {
      title: 'Missing author verification',
      authorId: await findMissingUserId(),
    });
    assert.equal(relationFailure.response.status, 409);
    assert.equal(relationFailure.data.error, 'The related record does not exist');
    assert.equal(JSON.stringify(relationFailure.data).includes('P2003'), false);

    console.log('API verification passed: list/read/create/update/delete, not-found, input validation, and foreign-key conflict.');
  } finally {
    try {
      if (server && server.listening) {
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        });
      }
    } finally {
      try {
        await prisma.post.deleteMany({ where: { authorId: author.id } });
        await prisma.user.delete({ where: { id: author.id } });
      } finally {
        await prisma.$disconnect();
      }
    }
  }
}

async function findMissingPostId() {
  const lastPost = await prisma.post.findFirst({
    orderBy: { id: 'desc' },
    select: { id: true },
  });
  if (!lastPost || lastPost.id < 2147483647) return (lastPost?.id || 0) + 1;

  const posts = await prisma.post.findMany({
    orderBy: { id: 'asc' },
    select: { id: true },
  });
  let candidate = 1;
  for (const post of posts) {
    if (post.id !== candidate) return candidate;
    candidate += 1;
  }
  if (candidate <= 2147483647) return candidate;

  throw new Error('No unused PostgreSQL post ID is available for verification');
}

main().catch((error) => {
  console.error('API verification failed:', error);
  process.exitCode = 1;
});
