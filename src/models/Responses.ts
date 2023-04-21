module.exports = (sequelize, DataTypes) => {
	return sequelize.define('response', {
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};