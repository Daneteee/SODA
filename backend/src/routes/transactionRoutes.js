const express = require("express");
const {getTransactions } = require("../controllers/transactionController");
const authenticate = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getTransactions);

module.exports = router;