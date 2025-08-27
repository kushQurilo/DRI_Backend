const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const morgan = require("morgan");

// Routes
const userRouter = require("./src/routes/userRouter");
const bannerRouter = require("./src/routes/bannerRoute");
const loanRouter = require("./src/routes/loansRoute");
const adminRouter = require("./src/routes/adminRoute");
const subscriptionRouter = require("./src/routes/subscriptionRoute");
const serviceRouter = require("./src/routes/serviceRoute");
const advocateRouter = require("./src/routes/advocateRouter");
const DRIRoutes = require("./src/routes/DriRoutes");
const KycRouters = require("./src/routes/KycRouter");
const EmiSettlementRoute = require("./src/routes/EmiSettlementRoute");
const driRoute = require("./src/routes/DriUser");
const InvoiceRouter = require("./src/routes/invoiceRoute");
const TncRoutetr = require("./src/routes/TncRouter");
const privacyPolicyRouter = require("./src/routes/privacyPolicyRoute");
const QRUPIRouter = require("./src/routes/UpiAndQrRoute");
const emiRouters = require("./src/routes/testingRoute");
// require("./src/config/cron-job/nodeCron");
const app = express();

// ----------------------------
// Middleware
// ----------------------------

// Enable CORS
app.use(cors());

// Security headers with Helmet (optimized)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(helmet.hidePoweredBy());

// Compression with Gzip/Brotli
app.use(
  compression({
    level: zlib.constants.Z_BEST_COMPRESSION,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ----------------------------
// Logging with IST timestamp
// ----------------------------
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Custom token for IST time
morgan.token("ist-date", function () {
  const d = new Date();
  const istTime = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  const day = String(istTime.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[istTime.getMonth()];
  const year = istTime.getFullYear();
  const hours = String(istTime.getHours()).padStart(2, "0");
  const minutes = String(istTime.getMinutes()).padStart(2, "0");
  const seconds = String(istTime.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year}:${hours}:${minutes}:${seconds} +0530`;
});

// Custom combined format using IST
const istFormat =
  ':remote-addr - :remote-user [:ist-date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
app.use(morgan(istFormat, { stream: accessLogStream }));

// ----------------------------
// Static files
// ----------------------------
app.use(
  "/public/uploads/banner",
  express.static(path.resolve("public/uploads/banner"))
);

// ----------------------------
// API Routes
// ----------------------------
const baseURI = "/api/v1/";

app.use(`${baseURI}admin`, adminRouter);
app.use(`${baseURI}user`, userRouter);
app.use(`${baseURI}banner`, bannerRouter);
app.use(`${baseURI}loan`, loanRouter);
app.use(`${baseURI}subcription`, subscriptionRouter);
app.use(`${baseURI}service`, serviceRouter);
app.use(`${baseURI}advocate`, advocateRouter);
app.use(`${baseURI}driworks`, DRIRoutes);
app.use(`${baseURI}kyc`, KycRouters);
app.use(`${baseURI}emi`, EmiSettlementRoute);
app.use(`${baseURI}driuser`, driRoute);
app.use(`${baseURI}invoice`, InvoiceRouter);
app.use(`${baseURI}tnc`, TncRoutetr);
app.use(`${baseURI}privacy`, privacyPolicyRouter);
app.use(`${baseURI}upi`, QRUPIRouter);
app.use(`${baseURI}emiSettle`, emiRouters);

// ----------------------------
// 404 Handler
// ----------------------------
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// ----------------------------
// Global Error Handler
// ----------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
});

module.exports = app;
