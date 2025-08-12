const { privacyPolicy, getAllPolicy } = require('../controllers/PrivacyPolicyController');

const privacyPolicyRouter = require('express').Router();

privacyPolicyRouter.post('/',privacyPolicy);
privacyPolicyRouter.get('/',getAllPolicy);

module.exports = privacyPolicyRouter;