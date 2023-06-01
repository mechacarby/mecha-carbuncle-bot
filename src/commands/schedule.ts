import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { sequelize } from '../data';

function create_reminder_embed(user) {
	const reminder_embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Testing Title ')
		.setDescription(`Testing Description ${user}`)
		.addFields(
			{ name: 'Test Name', value: 'Test Value' },
		)
		;
	return reminder_embed;
}
const commands = {
	schedule: {
		description: 'Manage event schedules',
		subcommands: {
			new: 'Create a new event schedule',
			edit: 'Modify an existing event schedule',
			delete: 'Delete an event schedule',
			list: 'List all event schedules',
		},
		attributes: [
			{
				commands: ['new', 'edit'],
				options : {
					role: (c => c.addRoleOption(option => option
						.setName('role')
						.setDescription('The role associated with this event. Will notify this role in reminders.'))),
					channel: (c => c.addChannelOption(option => option
						.setName('channel')
						.setDescription('Channel to post reminders in')
						.addChannelTypes(
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement,
							ChannelType.AnnouncementThread,
						)
					)),
					description: (c => c.addStringOption(option => option
						.setName('description')
						.setDescription('Optional description of the event')
						.setMaxLength(1000)
					)),
				},
			},
			{
				commands: ['new'],
				options: {
					timezone: (c => c.addStringOption(option => option
						.setName('timezone')
						.setDescription('Timezone that this event is based in')
						.setAutocomplete(true)
						.setRequired(true)
					)),
					name: (c => c.addStringOption(option => option
						.setName('name')
						.setDescription('Name of the event - defaults to "Raid"')
						.setMaxLength(100)
					)),
				},
			},
			{
				commands: ['edit'],
				options: {
					timezone: (c => c.addStringOption(option => option
						.setName('timezone')
						.setDescription('Timezone that this event is based in')
						.setAutocomplete(true)
					)),
					new_name: (c => c.addStringOption(option => option
						.setName('new-name')
						.setDescription('Rename the event to this new name')
						.setMaxLength(100)
					)),
				},
			},
			{
				commands: ['edit', 'delete'],
				options: {
					name: (c => c.addStringOption(option => option
						.setName('name')
						.setDescription('Name of the event to select')
						.setMaxLength(100)
						.setAutocomplete(true)
						.setRequired(true)
					)),
				},
			},
		],
		subcommandgroups: {
			rule: {
				description: 'Manage the rules that describe when an even occurs',
				subcommands: {
					new: 'Create a new rule',
					edit: 'Modify parts of an existing rule',
					delete: 'Delete a rule',
					replace: 'Replace an exisint rule',
					list: 'List all rules for a schedule',
				},
				attributes: [
					{
						commands: ['new', 'edit', 'delete', 'replace', 'list'],
						options: {
							event_name: (c => c.addStringOption(option => option
								.setName('event_name')
								.setDescription('Name of the event schedule to select')
								.setMaxLength(10)
								.setAutocomplete(true)
							)),
						},
					},
					{
						commands: ['new', 'replace'],
						options : {
							start_time: (c => c.addStringOption(option => option
								.setName('start_time')
								.setDescription('Time the event starts (hh:mm) ')
								.setMaxLength(10)
								.setRequired(true)
							)),
						},
					},
					{
						commands: ['edit'],
						options : {
							start_time: (c => c.addStringOption(option => option
								.setName('start_time')
								.setDescription('Time the event starts (hh:mm) ')
								.setMaxLength(10)
							)),
						},
					},
					{
						commands: ['new', 'edit', 'replace'],
						options : {
							start_day: (c => c.addStringOption(option => option
								.setName('start_day')
								.setDescription('Day the event starts (MM/DD). Used for one-time events, or with repeat_interval')
								.setMaxLength(10)
							)),
							duration: (c => c.addNumberOption(option => option
								.setName('duration')
								.setDescription('Duration of the event in hours')
								.setMinValue(0)
							)),
							repeat_interval: (c => c.addIntegerOption(option => option
								.setName('repeat_interval')
								.setDescription('Repeat the event every N days. Mutually exclusive with other repeat options, and requires start_day')
								.setMinValue(1)
							)),
							repeat_dow: (c => c.addIntegerOption(option => option
								.setName('repeat_day_of_week')
								.setDescription('Repeat the event on this day of the week')
								.setChoices(
									{ name: 'Sunday', value: 0 },
									{ name: 'Monday', value: 1 },
									{ name: 'Tuesday', value: 2 },
									{ name: 'Wednesday', value: 3 },
									{ name: 'Thursday', value: 4 },
									{ name: 'Friday', value: 5 },
									{ name: 'Saturday', value: 6 },
								)
							)),
							repeat_day_month: (c => c.addIntegerOption(option => option
								.setName('repeat_day_of_month')
								.setDescription('Repeat the event on this day of the month.')
								.setMinValue(1)
								.setMaxValue(31)
							)),
							repeat_week: (c => c.addIntegerOption(option => option
								.setName('repeat_week')
								.setDescription('Repeat the event on this week of the month.')
								.setMinValue(1)
								.setMaxValue(6)
							)),
							repeat_month: (c => c.addIntegerOption(option => option
								.setName('repeat_month')
								.setDescription('Repeat the event on this month of the year.')
								.setChoices(
									{ name: 'January', value: 1 },
									{ name: 'February', value: 2 },
									{ name: 'March', value: 3 },
									{ name: 'April', value: 4 },
									{ name: 'May', value: 5 },
									{ name: 'June', value: 6 },
									{ name: 'July', value: 7 },
									{ name: 'August', value: 8 },
									{ name: 'September', value: 9 },
									{ name: 'October', value: 10 },
									{ name: 'November', value: 11 },
									{ name: 'December', value: 12 },
								)
							)),
						},
					},
					{
						commands: ['edit', 'delete', 'replace'],
						options: {
							id: (c => c.addStringOption(option => option
								.setName('rule_number')
								.setDescription('The number of the rule to select')
								.setRequired(true)
								.setAutocomplete(true)
							)),
						},
					},
				],
			},
			event: {
				description: 'View, modify, or cancel upcoming events (without changing the overall schedule)',
				subcommands: {
					new: 'Create a one time event',
					move: 'Move an event to a different date/time',
					cancel: 'Cancel an upcoming event',
					list: 'List upcoming events',
				},
				attributes: [
					{
						commands: ['move', 'cancel', 'list', 'new'],
						options: {
							event_name: (c => c.addStringOption(option => option
								.setName('event_name')
								.setDescription('Name of the event schedule to select')
								.setMaxLength(100)
								.setAutocomplete(true)
							)),
						},
					},
					{
						commands: ['move', 'cancel'],
						options: {
							reason: (c => c.addStringOption(option => option
								.setName('reason')
								.setDescription('Optional reason for modifing event')
								.setMaxLength(1000)
							)),
							event_id: (c => c.addStringOption(option => option
								.setName('event_id')
								.setDescription('Specific Event to select - defaults to the one occuring next')
								.setMaxLength(10)
							)),
						},
					},
					{
						commands: ['new', 'move'],
						options: {
							day: (c => c.addStringOption(option => option
								.setName('day')
								.setDescription('Day of the event (MM/DD)')
								.setMaxLength(10)
								.setRequired(true)
							)),
							duration: (c => c.addNumberOption(option => option
								.setName('duration')
								.setDescription('Duration of the event in hours')
								.setMinValue(0)
							)),
						},
					},
					{
						commands: ['move'],
						options: {
							start_time: (c => c.addStringOption(option => option
								.setName('start_time')
								.setDescription('New time the event starts (hh:mm)')
								.setMaxLength(10)
							)),
						},
					},
					{
						commands: ['new'],
						options: {
							start_time: (c => c.addStringOption(option => option
								.setName('start_time')
								.setDescription('Time the event starts (hh:mm)')
								.setMaxLength(10)
								.setRequired(true)
							)),
						},
					},
				],
			},
		},
	},
};
function create_command(name, command, built_command = null) {
	built_command ??= new SlashCommandBuilder();
	built_command
		.setName(name)
		.setDescription(command.description);
	if ('subcommands' in command) {
		for (const subcommandname in command.subcommands) {
			built_command.addSubcommand(
				subcommand => {
					subcommand
						.setName(subcommandname)
						.setDescription(command.subcommands[subcommandname]);
					command.attributes
						.filter(x => x.commands.includes(subcommandname))
						.forEach(a => {
							for (const optionname in a.options) {
								subcommand = a.options[optionname](subcommand);
							}
						});
					subcommand.options.sort((a, b) => b.required - a.required);
					return subcommand;
				}
			);
		}
	}
	if ('subcommandgroups' in command) {
		for (const subcommandgroup in command.subcommandgroups) {
			built_command.addSubcommandGroup(group =>
				create_command(subcommandgroup, command.subcommandgroups[subcommandgroup], group)
			);
		}
	}
	return built_command;
}


module.exports = {
	ready_for: ['dev'],
	data: create_command(
		'schedule',
		commands.schedule,
	),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand == 'new') {
			await interaction.reply({
				content: 'New Schedule created!',
				ephemeral: true,
			});
		}
	},
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		const subcommand = interaction.options.getSubcommand();
		let choices;
		let common_choices;

		if (focusedOption.name === 'timezone') {
			common_choices = [
				'America/Los_Angeles',
				'America/Denver',
				'America/Chicago',
				'America/New_York',
				'Europe/London',
				'Europe/Paris',
			];
			choices = Intl.supportedValuesOf('timeZone');
		}

		if (focusedOption.name === 'name' && ['edit'].includes(subcommand)) {
			choices = (await Schedule.findAll({
				raw: true,
				attributes: ['name'],
				where: { 'guild_id': interaction.guild_id },
			})).map(x => x.name);
		}

		let filtered;

		if (focusedOption.value == '' && common_choices) {
			filtered = common_choices;
		}
		else {
			const searches = focusedOption.value.split(' ').map(x => new RegExp(x.split('').join('\\w*'), 'gi'));
			filtered = choices.filter(choice => searches.every(s => choice.search(s) >= 0)).slice(0, 25);
		}

		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
};