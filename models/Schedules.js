module.exports = (sequelize, DataTypes) => {
	return sequelize.define('schedules', {
		guild_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			unique: true,
			allowNull: false,
			default: 'Raid',
		},
		reminder_24h: {
			type: DataTypes.BOOLEAN,
			default: false,
		},
		reminder_12h: {
			type: DataTypes.BOOLEAN,
			default: false,
		},
		reminder_1h: {
			type: DataTypes.BOOLEAN,
			default: false,
		},
		reminder_0h: {
			type: DataTypes.BOOLEAN,
			default: true,
		},
		repeats: {
			type: DataTypes.BOOLEAN,
			default: false,
		},
	}, {
		timestamps: false,
	});

};
