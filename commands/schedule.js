const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Manage schedules'),
	async execute(interaction) {
		await interaction.reply('Hello World');
	},
};