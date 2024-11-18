// Import necessary modules
const express = require("express");
const router = express.Router();
const Project = require("../models/project");  // Import the project model
const Course = require("../models/course");    // Import the course model
const AuthenticationMiddleware = require("../extensions/authentication");  // Authentication middleware

// GET /projects - Show the list of projects
router.get("/", async (req, res, next) => {
  try {
    let projects = await Project.find().sort([["dueDate", "ascending"]]);  // Sort projects by due date
    res.render("projects/index", {
      title: "Project Tracker",
      dataset: projects,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// GET /projects/add - Show the form to add a new project
router.get("/add", AuthenticationMiddleware, async (req, res, next) => {
  try {
    let courseList = await Course.find().sort([["name", "ascending"]]);  // Get all courses sorted by name
    res.render("projects/add", {
      title: "Add a New Task",
      courses: courseList,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /projects/add - Add the new project
router.post("/add", AuthenticationMiddleware, async (req, res, next) => {
  try {
    console.log("Received Data:", req.body);  // Debugging line to check the form data

    let newProject = new Project({
      name: req.body.name,
      dueDate: req.body.dueDate,
      course: req.body.course,
      status: req.body.status || "Pending",  // Default to Pending if not provided
    });

    await newProject.save();  // Save the project to the database
    res.redirect("/projects");  // Redirect to the project list page
  } catch (error) {
    next(error);
  }
});


// GET /projects/edit/_id - Show the form to edit a project
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  try {
    let projectId = req.params._id;  // Get the project ID from the URL
    let projectData = await Project.findById(projectId);  // Find project by ID
    let courseList = await Course.find().sort([["name", "ascending"]]);  // Get courses for the dropdown
    res.render("projects/edit", {
      title: "Edit Task Info",
      project: projectData,
      courses: courseList,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// POST /projects/edit/_id - Save the edited project info
// GET /projects/edit/_id - Show the form to edit a project
router.get("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  try {
    let projectId = req.params._id;  // Get the project ID from the URL
    let projectData = await Project.findById(projectId).populate('course');  // Find project by ID
    let courseList = await Course.find().sort([["name", "ascending"]]);  // Get courses for the dropdown
    res.render("projects/edit", {
      title: "Edit Task Info",
      task: projectData,  // Pass the project data to the template
      courses: courseList,  // Pass the courses to the template
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

// GET /projects/delete/_id - Delete a project
router.get("/delete/:_id", AuthenticationMiddleware, async (req, res, next) => {
  try {
    let projectId = req.params._id;  // Get the project ID from the URL
    await Project.findByIdAndRemove({ _id: projectId });  // Delete the project by ID
    res.redirect("/projects");  // Redirect to the project list page
  } catch (error) {
    next(error);
  }
});
// POST /projects/edit/_id - Save the edited project info
router.post("/edit/:_id", AuthenticationMiddleware, async (req, res, next) => {
  try {
    let projectId = req.params._id;
    await Project.findByIdAndUpdate(projectId, {
      name: req.body.name,
      dueDate: req.body.dueDate,
      course: req.body.course,
      status: req.body.status,
    });
    res.redirect("/projects");  // Redirect to the project list page
  } catch (error) {
    next(error);
  }
});


// Export the router object to use in the main app
module.exports = router;
