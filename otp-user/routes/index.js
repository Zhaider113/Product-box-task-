const   express         = require('express'),
        router          = express.Router();

const userController = require('../controllers/user');

// register email with validators
router.post('/users', userController.createUser);
router.post('/users/generateOTP', userController.generateOTP);
router.get('/users/:user_id/verifyOTP', userController.verifyOTP);


module.exports = router;