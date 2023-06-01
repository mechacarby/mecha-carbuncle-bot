import { mode, clientId, dev_clientId, token, dev_token } from './config.json';
import { REST, Routes } from 'discord.js';
import { assert } from 'node:console';
import fs from 'node:fs';
import path from 'node:path'

const reset = process.argv.includes('--reset') || process.argv.includes('-r');

let use_token, use_clientId;
if (mode == 'dev') {
	use_token = dev_token;
	use_clientId = dev_clientId;
}
else if (mode == 'prod') {
	use_token = token;
	use_clientId = clientId;
}
else {
	throw new Error(`Unknown run mode ${mode}`);
}

let commands = [];
// Grab all the command files from the commands directory you created earlier
const command_path = path.join(__dirname, 'commands');
const file_list: string[] = fs.readdirSync(command_path)
const commandFiles = file_list.filter(file => file.endsWith('.ts'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(path.join(command_path, file));
	if (command.ready_for.includes(mode)) {
		console.log(`Adding /${command.data.name}`);
		commands.push(command.data.toJSON());
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(use_token);

if (reset) commands = [];

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(use_clientId),
			{ body: commands },
		) as Object[];

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();