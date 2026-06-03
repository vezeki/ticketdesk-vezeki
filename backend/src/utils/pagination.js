function parsePagination(query) {
  const page = Math.max(1, parseInt(String(query.page || "1"), 10) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(String(query.limit || "20"), 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function meta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

module.exports = { parsePagination, meta };
