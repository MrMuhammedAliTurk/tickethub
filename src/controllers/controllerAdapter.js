/** Service sonucunu HTTP yanıtına dönüştüren ortak controller adaptörü. */
function adapt(serviceFunction, mapArguments) {
  return (req, res, next) => {
    try {
      const args = mapArguments(req);
      const response = serviceFunction(...args);
      if (response.status === 204) return res.status(204).end();
      return res.status(response.status).json(response.body);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { adapt };
