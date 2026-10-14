function sendList(res, rows, query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || 2, 1),
    100
  );

  const total = rows.length;
  const pages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const data = rows.slice(start, start + limit);

  return res.status(200).json({
    data,
    meta: {
      page,
      limit,
      total,
      pages
    }
  });
}

function sendCreated(res, data) {
  return res.status(201).json({
    data
  });
}

function sendOk(res, data) {
  return res.status(200).json({
    data
  });
}

function sendError(res, status, error) {
  return res.status(status).json({
    error
  });
}

module.exports = {
  sendList,
  sendCreated,
  sendOk,
  sendError
};