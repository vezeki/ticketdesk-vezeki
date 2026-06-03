const ticketService = require("./ticket.service");

async function list(req, res, next) {
  try {
    const result = await ticketService.list(req.user, req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const ticket = await ticketService.getById(req.user, req.params.id);
    res.json(ticket);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const ticket = await ticketService.create(req.user, req.body, req.files || []);
    res.status(201).json(ticket);
  } catch (e) {
    next(e);
  }
}

async function downloadAttachment(req, res, next) {
  try {
    const { absolutePath, downloadName } = await ticketService.getAttachmentForDownload(
      req.user,
      req.params.id,
      req.params.attachmentId
    );
    res.download(absolutePath, downloadName, (err) => {
      if (err) next(err);
    });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const ticket = await ticketService.update(req.user, req.params.id, req.body);
    res.json(ticket);
  } catch (e) {
    next(e);
  }
}

async function assign(req, res, next) {
  try {
    const ticket = await ticketService.assign(req.user, req.params.id, req.body.assignedToId ?? null);
    res.json(ticket);
  } catch (e) {
    next(e);
  }
}

async function addComment(req, res, next) {
  try {
    const comment = await ticketService.addComment(req.user, req.params.id, req.body);
    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
}

async function listComments(req, res, next) {
  try {
    const comments = await ticketService.listComments(req.user, req.params.id);
    res.json(comments);
  } catch (e) {
    next(e);
  }
}

async function finalize(req, res, next) {
  try {
    const ticket = await ticketService.finalize(req.user, req.params.id, req.body.resolutionNote);
    res.json(ticket);
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, downloadAttachment, update, finalize, assign, addComment, listComments };
