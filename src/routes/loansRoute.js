const { getPersonalLoan, createPersonalLoan } = require('../controllers/loansControll');

const loanRouter = require('express').Router();
loanRouter.post("/create",createPersonalLoan);
loanRouter.get('/',getPersonalLoan);

module.exports = loanRouter;