const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	ready_for: [],
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Manage schedules'),
	async execute(interaction) {
		await interaction.reply('Hello World');
	},
};