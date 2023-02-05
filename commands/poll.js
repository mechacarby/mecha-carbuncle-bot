const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder,
	TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');


function create_poll_embed(results, interaction, submitted) {

	const poll_title = interaction.options.getString('title') ?? 'Poll';
	const pollEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(poll_title);


	let time_limit = interaction.options.getNumber('time_limit');
	if (time_limit) {
		time_limit = time_limit * 60;
		pollEmbed.addFields(
			{ name: 'Poll ends', value: `<t:${Math.floor(submitted.createdTimestamp / 1000) + time_limit}:R>` },
		);
	}
	let total = 0;
	for (const [key, data] of results.entries()) {

		let field_text = `${results.get(key)?.users?.length}`;
		const user_list = results.get(key)?.users;

		if (interaction.options.getBoolean('show_users') && user_list) {
			if (user_list.length > 0) field_text += ' - ';
			for (const userId of user_list.slice(0, 10)) {
				field_text += `<@${userId}>`;
			}
		}

		pollEmbed.addFields({ name: data['value'], value: field_text });
		total += results.get(key)?.users?.length ?? 0;
	}
	pollEmbed.addFields({ name: 'Total Votes', value: `${total}` });
	const max_votes = interaction.options.getInteger('max_votes');
	if (max_votes) {
		pollEmbed.addFields({ name: 'Remaining Votes', value: `${max_votes - total}` });
	}
	return pollEmbed;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('poll')
		.setDescription('Create a poll')
		.addStringOption(option => option
			.setName('title')
			.setDescription('What is the poll about?'),
		)
		.addIntegerOption(option => option
			.setName('options')
			.setDescription('Number of options')
			.setMinValue(2).setMaxValue(5),
		)
		.addBooleanOption(option => option
			.setName('multiselect')
			.setDescription('Whether multiple options can be selected'),
		)
		.addRoleOption(option => option
			.setName('role')
			.setDescription('Lock replies to a role and ping it'),
		)
		.addNumberOption(option => option
			.setName('time_limit')
			.setDescription('Set a time limit on the poll (minutes)')
			.setMinValue(1)
			.setMaxValue(10000),
		)
		.addIntegerOption(option => option
			.setName('max_votes')
			.setDescription('Stop the poll at a certain number of votes')
			.setMinValue(1),
		)
		.addBooleanOption(option => option
			.setName('show_users')
			.setDescription('Show who has voted for a poll'),
		),
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId(`create_poll-${interaction.id}`)
			.setTitle('Create poll');

		// Add components to modal

		const num_options = interaction.options.getInteger('options') ?? 2;

		for (let i = 0; i < num_options; i++) {
			// Create the text input components
			const choice_input = new TextInputBuilder()
				.setCustomId(`pollinput${i}`)
			// The label is the prompt the user sees for this input
				.setLabel(`Choice ${i + 1}`)
			// Short means only a single line of text
				.setStyle(TextInputStyle.Short);


			// An action row only holds one text input,
			// so you need one action row per text input.
			modal.addComponents(new ActionRowBuilder().addComponents(choice_input));

		}
		await interaction.showModal(modal);

		// Get the Modal Submit Interaction that is emitted once the User submits the Modal
		const submitted = await interaction.awaitModalSubmit({
			// Timeout after 5 minutes of not receiving any valid Modals
			time: 300000,
			// Make sure we only accept Modals from the User who sent the original Interaction we're responding to
			filter: i => i.user.id === interaction.user.id,
		}).catch(error => {
			// Catch any Errors that are thrown
			console.error(error);
			return;
		});

		if (submitted) {
			const role_to_ping = interaction.options.getRole('role') ?? false;

			const results = new Map();

			const row = new ActionRowBuilder();

			if (!(submitted.fields?.fields)) {
				return;
			}

			for (const data of submitted.fields.fields.values()) {
				results.set(`${data.customId}`, {
					'value': data.value,
					'users': [],
				});
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(`${data.customId}`)
						.setLabel(data.value)
						.setStyle(ButtonStyle.Primary),
				);
			}

			const title = role_to_ping ? `Poll for ${role_to_ping}` : undefined;
			try {
				await submitted.reply({ content: title, embeds: [create_poll_embed(results, interaction, submitted)], components: [row] });
			}
			catch (error) {
				console.log(error);
			}


			// Setup collector to handle poll inputs
			const message = await submitted.fetchReply();

			let time_limit = interaction.options.getNumber('time_limit');
			if (time_limit) {
				time_limit = time_limit * 60000;
			}
			const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: time_limit });

			collector.on('collect', async i => {

				if (role_to_ping) {
					if (!i?.member?.roles?.cache?.has(role_to_ping.id)) {
						try {
							await i.reply({ content: 'That poll is not for you!', ephemeral: true });
						}
						catch (error) {
							console.error(error);
						}
						return;
					}
				}

				// Toggle a users inclusion in the choice the clicked on
				const result = results.get(i.customId);
				if (!(result.users.includes(i.user.id))) {
					result.users.push(i.user.id);
				}
				else {
					result.users = result.users.filter(item => item !== i.user.id);
				}

				// If multi select is not enabled, remove the use from other choices they have made.
				let total = 0;
				for (const [key, data] of results.entries()) {
					total += results.get(key)?.users?.length ?? 0;
					if (!(interaction.options.getBoolean('multiselect') ?? false) && (key != i.customId)) {
						data.users = data.users.filter(item => item !== i.user.id);
					}
				}

				try {
					await i.update({ embeds: [create_poll_embed(results, interaction, submitted)] });
				}
				catch (error) {
					console.log(error);
				}

				if (interaction.options.getInteger('max_votes') && total >= interaction.options.getInteger('max_votes')) {
					collector.stop();
				}
			});

			collector.on('end', async collected => {
				try {
					message.edit({ components: [] });
				}
				catch (error) {
					console.error(error);
				}
				console.log(`Collected ${collected.size} interactions.`);
			});
		}

	},
};