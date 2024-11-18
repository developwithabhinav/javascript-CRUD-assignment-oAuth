const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },  // Reference to the Course model
  status: { type: String, default: "In Progress" },
});
const Project = mongoose.model("Project", projectSchema);
module.exports = mongoose.model("Project", projectSchema);
