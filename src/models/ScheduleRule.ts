module.exports = (sequelize, DataTypes) => {
	return sequelize.define('scheduleRule', {
		start_date: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		initialized_through: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		repeat_interval: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		repeat_year: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		repeat_month: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		repeat_day: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		repeat_week: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		repeat_weekday: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
	}, {
		timestamps: false,
	});
};