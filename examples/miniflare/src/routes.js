const cors = require('cors');
const { router } = require('express-flare');

router.use((req, res, next) => {
  console.log('First middleware');

  next();
});

router.use((req, res, next) => {
  console.log('Second middleware');

  next();
});

router.error((error, req, res, next) => {
  console.log('Error handler');

  if (error.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }

  next();
});

router.use(cors());

router.get('/', async (req, res) => {
  res.json({ success: true });
});

router.get('/test', (req, res, next) => {
  console.log('Route middleware');

  next();
}, (req, res) => {
  res.json({ success: true });
}, 3000);

router.get('/test/:id', (req, res) => {
  console.log(req.params);

  res.json({ worked: true });
});

router.post('/test', (req, res) => {
  console.log(req.bodyContent);

  res.json({ success: true });
});

module.exports = router;
