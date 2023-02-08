module.exports = (sequelize, DataTypes) => {
	return sequelize.define('poll', {
		guild_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		channel_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		message_id: {
			type: DataTypes.STRING,
		},
		title: DataTypes.STRING,
		ends_at: DataTypes.DATE,
		show_users: DataTypes.BOOLEAN,
		multiselect: DataTypes.INTEGER,
		max_votes: DataTypes.INTEGER,
		role: DataTypes.STRING,
		hide_results: DataTypes.STRING,
	}, {
		timestamps: false,
	});

};
