const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', null, null, {
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const options = { foreignKey: {
	// allowNull: false,
	onDelete: 'CASCADE',
} };

const Poll = require('./models/Polls.js')(sequelize, Sequelize.DataTypes);
const Question = require('./models/Questions.js')(sequelize, Sequelize.DataTypes);
const Response = require('./models/Responses.js')(sequelize, Sequelize.DataTypes);

Question.hasMany(Response, options); Response.belongsTo(Question);
Poll.hasMany(Question, options); Question.belongsTo(Poll);


module.exports = { Poll, Response, Question, sequelize };
