module.exports = (sequelize, DataTypes) => {
	return sequelize.define('question', {
		value: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		custom_id : {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};