const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: {
    type: String,
    enum: ["Starter", "Growth", "Premium"],
    default: "Starter",
  },
  ticketLimit: { type: Number, default: 10 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
