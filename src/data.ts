import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize('database', '', undefined, {
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
	models:  [__dirname + '/models'],
});