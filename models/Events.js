module.exports = (sequelize, DataTypes) => {
	return sequelize.define('events', {
		date_time: DataTypes.DATE,
	}, {
		timestamps: false,
	});

};
