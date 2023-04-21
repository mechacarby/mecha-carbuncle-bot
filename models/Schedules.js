module.exports = (sequelize, DataTypes) => {
	return sequelize.define('schedules', {
		guild_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			default: 'Raid',
		},
		role: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		reminder_channel: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		timezone: {
			type: DataTypes.STRING,
			allowNull: false,
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
