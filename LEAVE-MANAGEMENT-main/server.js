import "dotenv/config";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

// Check MongoDB URI
console.log(
  process.env.MONGODB_URI
    ? "MongoDB URI Found"
    : "MongoDB URI Missing"
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

// Leave Schema
const leaveSchema = new mongoose.Schema({
  employeeName: String,
  leaveType: String,
  startDate: String,
  endDate: String,
  reason: String,
  status: {
    type: String,
    default: "Pending",
  },
});

const Leave = mongoose.model("Leave", leaveSchema);

// Get Leaves
app.get("/leaves", async (req, res) => {
  try {
    const leaves = await Leave.find();
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
});

// Apply Leave
app.post("/leaves", async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to apply leave" });
  }
});

// Update Leave Status
app.patch("/leaves/:id", async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// Delete Leave
app.delete("/leaves/:id", async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: "Leave deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete leave" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});