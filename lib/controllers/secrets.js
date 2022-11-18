const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const Secret = require('../models/Secret');


module.exports = Router()
  .get('/', [authenticate], async (req, res, next) => {
    try {
      const secrets = await Secret.getAll();
      res.json(secrets);
    } catch (error) {
      next(error);
    }
  })
  .post('/', async (req, res, next) => {
    try {
      const newSecret = await Secret.insert(req.body);

      res.json(newSecret);
    } catch (error) {
      next(error);
    }
  });
