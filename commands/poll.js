const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll'),
	async execute(interaction) {
		await interaction.reply('Hello world');
	},
};