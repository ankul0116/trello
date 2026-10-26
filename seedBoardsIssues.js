
require("dotenv").config();

const mongoose = require("mongoose");
const {
  organizationModel,
  boardsModel,
  issuesModel
} = require("./models");

async function seedBoardsIssues() {
  try {
    // Wait for the MongoDB connection started by models.js
    await mongoose.connection.asPromise();

    const organizations = await organizationModel.find();

    if (organizations.length === 0) {
      throw new Error(
        "No organizations found. Create users and organizations first."
      );
    }

    // Prevent accidental duplicate dummy data
    const existingBoards = await boardsModel.countDocuments();

    if (existingBoards > 0) {
      throw new Error(
        "Boards already exist. Clear existing dummy boards/issues first if you want to reseed."
      );
    }

    const boardTitles = [
      ["Website Development", "Bug Tracking", "Backend API", "Frontend UI"],
      ["UI Design", "UX Research", "Wireframes", "Design System", "Prototypes"],
      ["Social Media", "Content Planning", "Campaign Tracking", "SEO"],
      ["Assignments", "Project Tasks", "Research", "Documentation", "Presentation"],
      ["Daily Tasks", "Weekly Goals", "Personal Projects", "Learning Plan"]
    ];

    const issueTitles = [
      ["Create login page", "Fix validation bug", "Write API tests"],
      ["Update dashboard design", "Fix mobile layout", "Review navigation"],
      ["Prepare project report", "Resolve pending bugs"],
      ["Add user authentication", "Test API endpoints", "Update documentation"],
      ["Create task form", "Fix issue status", "Improve error handling"]
    ];

    const statuses = ["next_up", "progress", "done"];

    let totalBoards = 0;
    let totalIssues = 0;

    for (let i = 0; i < organizations.length; i++) {
      const org = organizations[i];

      // Use 4 boards for some orgs and 5 for others
      const titles = boardTitles[i % boardTitles.length];
      const numberOfBoards = i % 2 === 0 ? 4 : 5;

      for (let j = 0; j < numberOfBoards; j++) {
        const board = await boardsModel.create({
          title: titles[j],
          orgId: org._id
        });

        totalBoards++;

        // Create 2 or 3 issues for each board
        const numberOfIssues = (j % 2 === 0) ? 3 : 2;
        const issueList = issueTitles[(i + j) % issueTitles.length];

        const issues = [];

        for (let k = 0; k < numberOfIssues; k++) {
          issues.push({
            title: issueList[k],
            boardId: board._id,
            status: statuses[k % statuses.length]
          });
        }

        await issuesModel.insertMany(issues);
        totalIssues += issues.length;
      }

      console.log(`Created boards for: ${org.title}`);
    }

    console.log("\nDummy data created successfully!");
    console.log("Organizations:", organizations.length);
    console.log("Boards:", totalBoards);
    console.log("Issues:", totalIssues);

  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedBoardsIssues();
