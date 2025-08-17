const {
  importUsersFromCSV,
  getUsersList,
  searchUserById,
  getSingleUser,
} = require("../controllers/DriUser");
const csvUpload = require("../middlewares/csvMiddleware");

const driRoute = require("express").Router();
driRoute.post("/", csvUpload.single("csv"), importUsersFromCSV);
driRoute.get("/", getUsersList);
driRoute.get("/search", searchUserById);
driRoute.post("/single", getSingleUser);

module.exports = driRoute;
