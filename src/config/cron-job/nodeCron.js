const cron = require("node-cron");
const DrisModel = require("../../models/DriUserModel");

// Run every 1 min for testing (change to "0 10 * * *" for daily 10 AM)
cron.schedule("*/1 * * * *", async () => {
  console.log("Checking EMI reminder...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoDaysLater = new Date();
  twoDaysLater.setDate(today.getDate() + 2);
  twoDaysLater.setHours(23, 59, 59, 999);

  try {
    // ✅ EMI due within next 2 days
    const upcomingEmis = await DrisModel.find({
      status: "Pending",
      dateOfJoin: { $gte: today, $lte: twoDaysLater },
    }).populate("phone");

    for (let emi of upcomingEmis) {
      if (!emi.phone) continue;
      console.log(
        `Hello ${emi.name}, your EMI of ${
          emi.monthlyEmi
        } is due on ${emi.dueDate.toDateString()}`
      );
    }

    // ❌ EMI already overdue
    const overdueEmis = await DrisModel.find({
      status: "pending",
      dueDate: { $lt: today },
    }).populate("phone");

    for (let emi of overdueEmis) {
      if (!emi.phone) continue;
      console.log(
        `⚠️ Hello ${emi.name}, your EMI of ${
          emi.monthlyEmi
        } was due on ${emi.dueDate.toDateString()} but you haven't paid yet!`
      );
    }
  } catch (error) {
    console.error("Error in EMI reminder cron:", error);
  }
});
