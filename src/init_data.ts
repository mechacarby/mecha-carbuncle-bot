import { sequelize } from './data';

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);
