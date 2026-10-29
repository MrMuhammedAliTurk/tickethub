function result(status, body = null) {
  return { status, body };
}

function success(body, status = 200) {
  return result(status, body);
}

function failure(status, error, extra = {}) {
  return result(status, { error, ...extra });
}

function noContent() {
  return result(204);
}

module.exports = { result, success, failure, noContent };
