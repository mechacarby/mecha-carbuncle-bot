const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Schedules = sequelize.define('schedules', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
    repeats: Sequelize.BOOLEAN,
	
});

module.exports = [
    Schedules,
]