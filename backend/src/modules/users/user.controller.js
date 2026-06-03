const userService = require("./user.service");

async function list(req, res, next) {
  try {
    const result = await userService.list(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const user = await userService.create(req.body, req.user.role);
    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.update(req.params.id, req.body, req.user.role);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const user = await userService.deactivate(req.params.id);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

async function me(req, res, next) {
  try {
    const user = await userService.me(req.user.id);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await userService.updateMe(req.user.id, req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
}

async function listTechnicians(req, res, next) {
  try {
    const data = await userService.listTechnicians();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, update, remove, me, updateMe, listTechnicians };
