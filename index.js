const { mode, dev_token, token } = require('./config.json');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
	],
});
const fs = require('node:fs');
const path = require('node:path');


client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!(
		interaction.isChatInputCommand() ||
		interaction.isMessageContextMenuCommand() ||
		interaction.isAutocomplete()
	)) return;

	let callback;


	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}


	if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
		callback = command.execute;
	}
	else if (interaction.isAutocomplete()) {
		callback = command.autocomplete;
	}

	try {
		callback(interaction);
	}
	catch (error) {
		console.error(error);
		if (!interaction.replied) {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

});

client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	for (const [commandName, command] of client.commands) {
		if ('reAttach' in command) {
			try {
				console.log(`Reattaching /${commandName}`);
				await command.reAttach(client);
			}
			catch (error) {
				console.error(`Error trying to re-attach data for command ${command.name}`);
				console.error(error);
			}
		}
	}
});

process.on('unhandledRejection', async (err) => {
	console.error('Unhandled Promise Rejection:\n', err);
});
process.on('uncaughtException', async (err) => {
	console.error('Uncaught Promise Exception:\n', err);
});
process.on('uncaughtExceptionMonitor', async (err) => {
	console.error('Uncaught Promise Exception (Monitor):\n', err);
});
// process.on('multipleResolves', (type, promise, reason) => {
// 	console.error('Multiple Resolves:\n', type, promise, reason);
// });

// Log in to Discord with your client's token
if (mode == 'dev') {
	client.login(dev_token);
}
else if (mode == 'prod') {
	client.login(token);
}
else {
	throw new Error(`Unknown run mode ${mode}`);
}
