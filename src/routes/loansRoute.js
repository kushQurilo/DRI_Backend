const {
  createPersonalLoan,
  getAllLoans,
} = require("../controllers/loansControll");

const loanRouter = require("express").Router();
loanRouter.post("/create", createPersonalLoan);
loanRouter.get("/", getAllLoans);

module.exports = loanRouter;
