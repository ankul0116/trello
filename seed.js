
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const {
  userModel,
  organizationModel,
} = require("./models");

async function seedDatabase() {
  try {
    // Wait until MongoDB is connected
    await mongoose.connection.asPromise();

    const password = await bcrypt.hash("Test@12345", 10);

    // Create 10 dummy users
    const usersData = [
      { username: "ankul", email: "ankul@example.com" },
      { username: "rahul", email: "rahul@example.com" },
      { username: "priya", email: "priya@example.com" },
      { username: "rohan", email: "rohan@example.com" },
      { username: "neha", email: "neha@example.com" },
      { username: "aman", email: "aman@example.com" },
      { username: "simran", email: "simran@example.com" },
      { username: "karan", email: "karan@example.com" },
      { username: "riya", email: "riya@example.com" },
      { username: "arjun", email: "arjun@example.com" }
    ];

    const users = await userModel.insertMany(
      usersData.map(user => ({
        ...user,
        password
      }))
    );

    // Create 5 organizations with an admin each
    const organizationsData = [
      {
        title: "Development Team",
        description: "Software development projects",
        adminIndex: 0,
        memberIndexes: [1, 2]
      },
      {
        title: "Design Team",
        description: "UI and UX design work",
        adminIndex: 3,
        memberIndexes: [4, 5]
      },
      {
        title: "Marketing Team",
        description: "Marketing campaigns and planning",
        adminIndex: 6,
        memberIndexes: [7, 8]
      },
      {
        title: "College Project",
        description: "College assignments and projects",
        adminIndex: 1,
        memberIndexes: [3, 9]
      },
      {
        title: "Personal Tasks",
        description: "Personal productivity workspace",
        adminIndex: 9,
        memberIndexes: [0, 5]
      }
    ];

    const organizations = organizationsData.map(org => ({
      title: org.title,
      description: org.description,
      adminId: users[org.adminIndex]._id,
      members: org.memberIndexes.map(index => users[index]._id)
    }));

    await organizationModel.insertMany(organizations);

    console.log("Dummy data inserted successfully!");
    console.log("Users created:", users.length);
    console.log("Organizations created:", organizations.length);
    console.log("Password for all users: Test@12345");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
