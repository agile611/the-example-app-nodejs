module.exports.catchErrors = (fn) => (req, res, next) =>
  fn(req, res, next).catch((e) => {
    if (e.response) e.status = e.response.status
    next(e)
  })
