module.exports = (sequelize, DataTypes) => {
	return sequelize.define('events', {
		date_time: DataTypes.DATE,
		modified: {
			type: DataTypes.INTEGER,
			defaultValue: false,
		},
		canceled: {
			type: DataTypes.INTEGER,
			defaultValue: false,
		},
		reason: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	}, {
		timestamps: false,
	});

};
