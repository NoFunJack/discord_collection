// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { token,guildId} = require('./config.json');

const colpkg = require('./colmgr.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

let col;
// When the client is ready, run this code (only once)
client.once('ready', async () => {
	col = await colpkg.init_db(guildId + '.db');
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	console.log("Command /" + commandName + " from " + interaction.user.username);

	if (commandName === 'myprofile') {
        let user;
        try{
            user = col.getUserProfile(interaction.user.id);
        } catch(err){
            try {
                col.createUserProfile(interaction.user.id);
                user = col.getUserProfile(interaction.user.id);
            } catch(err){
                console.error(err);
            }
        }

        console.log(user);

		await interaction.reply("you have "+ user.boosterPoints + " Boosterpoints!");
	} else if (commandName === 'collection') {
        let list = col.getCardsTxt(interaction.user.id);
        list ||= "none found";
		await interaction.reply(list);
	} else if (commandName === 'user') {
        console.log(interaction);
		await interaction.reply('User info.');
	}
});

// Login to Discord with your client's token
client.login(token);


process.on('SIGINT', () => {
  console.info('SIGTERM signal received.');
  client.destroy();
  console.info("bot logged out");
  process.exit(0);
});
