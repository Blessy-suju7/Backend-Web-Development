let posts = [];
let nextId = 1;

function findAll() {
    return [...posts]; //return a copy
}

function findbyId(id) {
  return posts.find(p => p.id === Number(id)) || null;
}
function create(input){
    const post = { id: nextId++, ...input, createAt: Date.now() };
    posts.push(post);
    return { ...post }; //return a copy
}

function update (id, patch) {
    const index = posts.findIndex(p => p.id === Number(id));
    if (index === -1) return null;
    posts[index] = { ...posts[index], ...patch};
    return { ...posts[index] }; //return a copy
}

function remove(id) {
const index = posts.findIndex(p => p.id === Number(id));
if (index === -1) return false;
posts.splice(index, 1);
return true;
}
module.exports = {
    findAll,
    findbyId,
    create,
    update,
    remove,
};