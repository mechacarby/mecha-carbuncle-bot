import { ChatInputCommandInteraction } from 'discord.js';
import { CommandStructure } from '../schedule';

export const event_structure: CommandStructure = {
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
};

export async function event_logic(interaction: ChatInputCommandInteraction) {
	return;
}