// Require the necessary discord.js classes
const { Client, Intents, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { token,guildId} = require('./config.json');

const colpkg = require('./colmgr.js');
const { getSetBooster, setExists} = require('./boosterBuilder.js');

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

        console.log("created User\n\n" + user);

		await interaction.reply("you have "+ user.boosterPoints + " Boosterpoints!");
	} else if (commandName === 'try_booster') {
        await buildSetSelector(interaction,'try_booster');
	} else if (commandName === 'open_booster') {
        await buildSetSelector(interaction,'open_booster');
    } else if (commandName === 'collection') {
        let list = col.getCardsTxt(interaction.user.id);
        list ||= "none found";
		await interaction.reply(list);
	} else if (commandName === 'user') {
        console.log(interaction);
		await interaction.reply('User info.');
	}
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isSelectMenu()) return;
    if (interaction.customId === 'try_booster') {
        openBooster(interaction,false);
	}
    async function openBooster(interaction, addToCollection ){
        let setId = interaction.values[0];
        let content = "ERROR"
        if (setExists(setId)) {
            content = "Simulate Booster\n\n"
                + getSetBooster(setId).map(c =>c.name).join("\n");
        } else {
            content = 'set \"'+ setId + '\" not found';
        }
		await interaction.update({ content: content, components: [] });
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

async function buildSetSelector(interaction,id){
    const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(id)
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Kamigawa: Neon Dynasty',
							//description: 'This is a description',
							value: 'neo',
						},
						{
							label: 'Innistrad: Crimson Vow',
							value: 'vow',
						},
						{
							label: 'Innistrad: Midnight Hunt',
							value: 'mid',
						},
					]),
			);

		await interaction.reply({ content: 'Select Set', components: [row] });
}
