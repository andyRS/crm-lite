require("dotenv").config();
const bcrypt = require("bcryptjs");
const { User } = require("./src/models");

async function createAdmin() {
  try {
    const hashed = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@crm.com",
      password: hashed,
      role: "admin"
    });
    console.log("Admin user created:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

createAdmin();