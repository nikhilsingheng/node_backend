const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("./Config");

// Code here! It works!
const User = sequelize.define("User", {
  name: Sequelize.STRING,
});

const Post = sequelize.define("Post", {
  title: Sequelize.STRING,
  content: Sequelize.TEXT,
});

User.hasMany(Post); // A user can have many posts
Post.belongsTo(User); // A post belongs to a user
