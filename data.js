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

const Schedule = require('./models/Schedules.js')(sequelize, Sequelize.DataTypes);
const Event = require('./models/Events.js')(sequelize, Sequelize.DataTypes);

Schedule.hasMany(Event, options); Event.belongsTo(Schedule);

const Poll = require('./models/Polls.js')(sequelize, Sequelize.DataTypes);
const Question = require('./models/Questions.js')(sequelize, Sequelize.DataTypes);
const Response = require('./models/Responses.js')(sequelize, Sequelize.DataTypes);

Question.hasMany(Response, options); Response.belongsTo(Question);
Poll.hasMany(Question, options); Question.belongsTo(Poll);


module.exports = { Schedule, Event, Poll, Response, Question, sequelize };
