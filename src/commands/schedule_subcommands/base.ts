import { ChannelType, ChatInputCommandInteraction } from 'discord.js';
import { CommandStructure } from '../schedule';
import { Schedule } from '../../models/Schedule';

export const schedule_structure: CommandStructure = {
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
};

export async function schedule_logic(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const args = interaction.options;

	const all_schedules = await Schedule.findAll({
		include:{ all: true, nested: true },
		where: {
			'guild_id': interaction.guildId,
		},
	});
	if (subcommand == 'new') {
		const name = args.getString('name') ?? 'Raid';

		if (all_schedules.find(x => x.name === name)) {
			await interaction.reply({
				content: `A schedule with the name ${name} already exists!`,
				ephemeral: true,
			});
			return;
		}

		const schedule = Schedule.create({
			guild_id: interaction.guildId,
			name: name,
			role: args.getRole('role'),
			reminder_channel: args.getChannel('channel') ?? interaction.channel,
			timezone: args.getString('timezone'),
			description: args.getString('description'),
		});

		await interaction.reply({
			content: `Schedule ${name} created! Add some scheduling rules to it with \`/schedule rules\`!`,
			ephemeral: true,
		});
		// const other = interaction.guild?.channels.cache.find((x: GuildBasedChannel) => x.name == 'other') as TextBasedChannel;
		// other?.send({
		// 	content: '',
		// 	embeds: [create_reminder_embed('Test')],
		// });
	}
	else if (['edit', 'delete'].includes(subcommand)) {
		if (all_schedules.length < 1) {
			await interaction.reply({
				content: 'This server has no event schedules!',
				ephemeral: true,
			});
			return;
		}
		if (all_schedules.length > 1 && !args.get('name')) {
			await interaction.reply({
				content: 'This server has more than one event schedule! Please specify the name of the schedule.',
				ephemeral: true,
			});
			return;
		}

		let schedule;
		const name = args.getString('name');
		if (all_schedules.length == 1) {
			schedule = all_schedules[0];
		}
		else {
			schedule = all_schedules.find(x => x.name == name);
		}

		if (!schedule) {
			await interaction.reply({
				content: `A schedule with the name ${name} does not exist!`,
				ephemeral: true,
			});
			return;
		}

		const new_name = args.getString('new-name');
		if (new_name && all_schedules.find(x => x.name === new_name)) {
			await interaction.reply({
				content: `A schedule with the name ${new_name} already exists!`,
				ephemeral: true,
			});
			return;
		}

		if (subcommand == 'edit') {

			const update_args: {[key: string]: any } = {
				name: new_name,
				timezone: args.getString('timezone'),
				reminder_channel: args.getChannel('channel'),
				description: args.getString('description'),
				role: args.getRole('role'),
			};
			// remove undefined values
			Object.keys(update_args).forEach(function(key) {
				if (update_args[key] === undefined) {
					delete update_args[key];
				}
			});

			schedule?.set(update_args);
			schedule.save();
			await interaction.reply({
				content: `Schedule ${name} edited!`,
				ephemeral: true,
			});
		}
		else if (subcommand == 'delete') {
			schedule.destroy();
			await interaction.reply({
				content: `Schedule ${name} deleted!`,
				ephemeral: true,
			});
		}
		else if (subcommand == 'list') {
			await interaction.reply({
				content: 'Schedules!',
				ephemeral: true,
			});
		}
	}
}