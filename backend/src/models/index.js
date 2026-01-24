const User = require("./user.model");
const Customer = require("./customer.model");

User.hasMany(Customer, { foreignKey: "user_id" });
Customer.belongsTo(User, { foreignKey: "user_id" });

module.exports = { User, Customer };
