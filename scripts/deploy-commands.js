const { SlashCommandBuilder} = require( '@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
require('dotenv').config()
const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const clientId = process.env.CLIENT_ID

const commands = [
  new SlashCommandBuilder().setName('myprofile').setDescription('Show my userprofile'),
  new SlashCommandBuilder().setName('collection').setDescription('Show my collection'),
  buildBoosterCommand('open_booster'),
  buildBoosterCommand('try_booster'),
  new SlashCommandBuilder().setName('award_all_players').setDescription('Give booster Points to all Players')
    .addIntegerOption(option =>
      option.setName('boosterpoints')
        .setDescription('number of booster points to award all players')
        .setRequired(true))
]
  .map(command => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)

function buildBoosterCommand(name){
  return  new SlashCommandBuilder()
    .setName(name)
    .setDescription('Open a booster')
    .addIntegerOption(option => 
      option.setName('amount')
        .setDescription('how many boosters')
    ) 
}
