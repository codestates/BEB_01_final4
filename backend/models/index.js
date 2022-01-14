"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};
const dotenv = require("dotenv").config();

// import { db_host, db_user, db_pass } from "./db.js";

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, process.env.PASSWORD, config);
}

fs.readdirSync(__dirname)
    .filter((file) => {
        return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.collections = require('./collections')(sequelize, Sequelize);
db.users = require("./users")(sequelize, Sequelize);
db.nfts = require("./nfts")(sequelize, Sequelize);
db.trades = require("./trades")(sequelize, Sequelize);

// collections : nfts -> 1:N
db.collections.hasMany(db.nfts, { as: "nfts" });
db.nfts.belongsTo(db.collections, {
  foreignKey: 'contractAddress',
  as: "collection"
});

// users : collections -> 1:N
db.users.hasMany(db.collections, { as: "collections" });
db.collections.belongsTo(db.users, {
  foreignKey: 'address',
  as: 'user'
});

// nfts: trades -> 1:N
db.nfts.hasMany(db.trades, { as: "trades" });
db.trades.belongsTo(db.nfts, {
  foreignKey: ['token_ids','contractAddress'],
  as: 'asset'
});

module.exports = db;
