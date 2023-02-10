const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder,
	TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

const { Op } = require('sequelize');

const { Poll, Question, Response, sequelize } = require('../data.js');

async function create_poll_embed(poll, ended = false) {

	const pollEmbed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle(ended ? `${poll.title} (ended)` : poll.title);


	const ends_at = poll.ends_at;
	if (ends_at) {
		pollEmbed.addFields(
			{ name: `Poll ${ended ? 'ended' : 'ends'}`, value: `<t:${Math.floor(ends_at / 1000)}:R>` },
		);
	}

	if (!poll.hide_results || (poll.hide_results == 'hide' && ended)) {
		for (const question of poll.questions) {

			let field_text = `${question.responses.length}`;

			const MAX_USERS = 20;

			if (poll.show_users && question.responses.length > 0) {
				field_text += ` - <@${question.responses[0].user_id}>`;
				for (const response of question.responses.slice(1, MAX_USERS)) {
					field_text += `, <@${response.user_id}>`;
				}
				if (question.responses.length > MAX_USERS) field_text += ', ...';
			}

			pollEmbed.addFields({ name: question.value, value: field_text });
		}
	}

	const total = await Response.count({
		where: {
			'$question.poll.id$': poll.id,
		},
		distinct: true,
		col: 'user_id',
		include: { all: true, nested: true },
	});

	pollEmbed.addFields({ name: 'Total Votes', value: `${total}` });
	const max_votes = poll.max_votes;
	if (max_votes && !ended) {
		pollEmbed.addFields({ name: 'Remaining Votes', value: `${max_votes - total}` });
	}
	return pollEmbed;
}

async function end_poll(message, poll) {
	try {
		if (poll.hide_results == 'hideall') {
			poll.hide_results = null;
			message.interaction.user?.send({ embeds: [await create_poll_embed(poll, true)] });
		}
		message.edit({ embeds: [await create_poll_embed(poll, true)], components: [] });
		await poll.destroy();
	}
	catch (error) {
		console.error(error);
	}
}

async function attach_collector(message, poll) {
	// console.log(message);

	const time_remaining = poll.ends_at - Date.now();
	if (poll.ends_at && time_remaining < 0) {
		await end_poll(message, poll);
	}
	const collet_time = poll.ends_at ? time_remaining : undefined;

	const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: collet_time });

	collector.on('collect', async i => {

		if (i.customId == 'stop') {
			if (i.user.id == message.interaction.user.id) {
				collector.stop();
			}
			else {
				try {
					await i.reply({ content: 'You can\' do that!', ephemeral: true });
				}
				catch (error) {
					console.error(error);
				}
			}
			return;
		}

		if (poll.role && !(i?.member?.roles?.cache?.some(r => r.id === poll.role))) {
			try {
				await i.reply({ content: 'That poll is not for you!', ephemeral: true });
			}
			catch (error) {
				console.error(error);
			}
			return;
		}

		const t = await sequelize.transaction();

		try {

			// TODO: Redo as Quesions?

			const question = await Question.findOne({
				where: {
					custom_id: i.customId,
					pollId: poll.id,
				},
			});

			// Toggle a users inclusion in the choice the clicked on

			const response = await question.getResponses({
				where: {
					user_id: i.user.id,
				},
			});

			if (response[0]) {
				await response[0].destroy({});
			}
			else {
				await question.createResponse({
					user_id: i.user.id,
				});
			}


			// If multi select is not enabled, remove the use from other choice(s) they have made.

			if (!poll.multiselect) {
				const old_responses = await Response.findAll({
					where: {
						'user_id': i.user.id,
					},
					include: {
						model: Question,
						where: {
							[Op.and] : {
								custom_id: {
									[Op.ne]: i.customId,
								},
								pollId: poll.id,
							},
						},
						required: true,
					},
				});
				for (const old_response of old_responses) {
					old_response.destroy();
				}
			}

			await poll.reload({
				include: { all: true, nested: true },
			});

			await i.update({ embeds: [await create_poll_embed(poll)] });

			if (poll.max_votes) {
				const total = await Response.count({
					where: {
						'$question.poll.id$': poll.id,
					},
					distinct: true,
					col: 'user_id',
					include: { all: true, nested: true },
				});

				if (total >= poll.max_votes) collector.stop();
			}

			t.commit();
		}
		catch (error) {
			console.log(error);
			await t.rollback();
		}
	});

	collector.on('end', async () => {
		end_poll(message, poll);
		// console.log(`Collected ${collected.size} interactions.`);
	});
}

module.exports = {
	ready_for: ['dev'],
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
		)
		.addStringOption(option => option
			.setName('hide_results')
			.setDescription('hide votes until the vote has ended or entirely')
			.addChoices(
				{ name: 'Hide votes until poll is concluded', value: 'hide' },
				{ name: 'Only show votes to you', value: 'hideall' },
			),
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
				.setValue(`Option ${i + 1}`)
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
			const role_to_ping = interaction.options.getRole('role') ?? null ;
			const poll_title = interaction.options.getString('title') ?? 'Poll';
			const time_limit = interaction.options.getNumber('time_limit') ?? null;
			const ends_at = (time_limit && submitted.createdTimestamp) ? submitted.createdTimestamp + time_limit * 60000 : null;
			const show_users = interaction.options.getBoolean('show_users') ?? false;
			const max_votes = interaction.options.getInteger('max_votes') ?? null;
			const multiselect = interaction.options.getBoolean('multiselect') ?? false;
			const hide_results = interaction.options.getString('hide_results') ?? null;

			const row = new ActionRowBuilder();

			if (!(submitted.fields?.fields)) {
				return;
			}

			for (const data of submitted.fields.fields.values()) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(`${data.customId}`)
						.setLabel(data.value)
						.setStyle(ButtonStyle.Primary),
				);
			}

			const header = role_to_ping ? `Poll for ${role_to_ping}` : undefined;

			const poll = await Poll.create({
				guild_id: interaction.guildId,
				channel_id: interaction.channelId,
				title: poll_title,
				ends_at: ends_at,
				show_users: show_users,
				multiselect: multiselect,
				max_votes: max_votes,
				role: role_to_ping?.id ?? null,
				hide_results: hide_results,
			});

			for (const data of submitted.fields.fields.values()) {
				await poll.createQuestion({
					'custom_id' : data.customId,
					'value': data.value,
				});
			}

			await poll.reload({
				include: { all: true, nested: true },
			});

			let message;
			try {
				await submitted.reply({ content: header, embeds: [await create_poll_embed(poll)], components: [
					row,
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('stop')
							.setLabel('Stop Poll')
							.setStyle(ButtonStyle.Danger),
					),
				] });
				message = await submitted.fetchReply();
			}
			catch (error) {
				await poll.destroy();
				console.log(error);
				return;
			}

			// Save created poll to database
			poll.message_id = message.id;
			await poll.save();


			// Setup collector to handle poll inputs
			try {
				await attach_collector(message, poll);
			}
			catch (error) {
				console.log(error);
			}
		}

	},
	async reAttach(client) {
		const polls = await Poll.findAll({ include:{ all: true, nested: true } });
		console.log(`${polls.length} existing polls!`);
		for (const existing_poll of polls) {
			try {
				const channel = await client.channels.fetch(existing_poll.channel_id);
				const message = await channel.messages.fetch(existing_poll.message_id);
				if (message.size) continue;

				await attach_collector(message, existing_poll);
			}
			catch (error) {
				console.log(error);
			}
		}
	},
};