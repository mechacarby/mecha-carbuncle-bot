import { ChatInputCommandInteraction } from 'discord.js';
import { CommandStructure } from '../schedule';


export const rule_structure: CommandStructure = {
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
};

export async function rule_logic(interaction: ChatInputCommandInteraction) {
	return;
}