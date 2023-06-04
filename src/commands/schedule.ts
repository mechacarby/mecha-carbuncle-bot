import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, AutocompleteInteraction, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, Client } from 'discord.js';
import { Schedule } from '../models/Schedule';
import { Event } from '../models/Event';
import { schedule_logic, schedule_structure } from './schedule_subcommands/base';
import { event_logic, event_structure } from './schedule_subcommands/event';
import { rule_logic, rule_structure } from './schedule_subcommands/rule';

function create_reminder_embed(user: string) {
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

async function trigger_event(event: Event, client: Client<true>) {
	if (event.canceled) return;
	const channel_id = event.scheduleRule.schedule.reminder_channel;
	if (!channel_id) return;
	const channel = await client.channels.fetch(channel_id);
	if (!channel?.isTextBased()) return;
	channel.send({ content: '' });
}


interface CommandBuilderFunction {
	commands: string[];
	options: {
		[optionName: string]: {
			(c: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder
		}
	}
}

export interface CommandStructure {
	description: string;
	subcommands: {
		[sucommandName: string]: string
	}
	attributes: CommandBuilderFunction[];
}


function create_command(name: string, command: CommandStructure, built_command: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder) {
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
					subcommand.options.sort((a, b) => Number(b.required) - Number(a.required));
					return subcommand;
				}
			);
		}
	}
	return built_command;
}

const final_built_command = create_command('schedule', schedule_structure, new SlashCommandBuilder()) as SlashCommandBuilder;
const groups: {[key: string]: CommandStructure } = {
	rule: rule_structure,
	event: event_structure,
};

for (const subcommandgroup in groups) {
	final_built_command.addSubcommandGroup(group =>
		create_command(subcommandgroup, groups[subcommandgroup], group) as SlashCommandSubcommandGroupBuilder
	);
}

module.exports = {
	ready_for: ['dev'],
	data: final_built_command,
	async execute(interaction: ChatInputCommandInteraction) {
		const subcommandgroup = interaction.options.getSubcommandGroup();

		// console.log(`${subcommandgroup}/${subcommand}`);
		if (!subcommandgroup) {
			schedule_logic(interaction);
		}
		else if (subcommandgroup === 'rule') {
			rule_logic(interaction);
		}
		else if (subcommandgroup === 'event') {
			event_logic(interaction);
		}
	},
	async autocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);
		const subcommand = interaction.options.getSubcommand();
		let choices: string[] = [];
		let common_choices: string[] = [];

		if (focusedOption.name === 'timezone') {
			common_choices = [
				'America/Los_Angeles',
				'America/Denver',
				'America/Phoenix',
				'America/Chicago',
				'America/New_York',
				'Europe/London',
				'Europe/Paris',
			];
			choices = Intl.supportedValuesOf('timeZone');
		}
		else if (focusedOption.name === 'name' && ['edit'].includes(subcommand)) {
			choices = (await Schedule.findAll({
				raw: true,
				attributes: ['name'],
				where: { 'guild_id': interaction.guildId },
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
	async reAttach(client: Client<true>) {
		// Also create events as needed from rules.
		const events = await Event.findAll({ include:{ all: true, nested: true } });
		console.log(`${events.length} existing events!`);
		for (const event of events) {
			const time_left = event.date_time.getTime() - Date.now();
			if (time_left < 0) {
				console.log('Event has already passed!!');
				continue;
			}
			else {
				setTimeout(function() {
					// Error handling?
					trigger_event(event, client);
				}, time_left);
			}
		}
	},
};