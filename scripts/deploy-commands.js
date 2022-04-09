import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import dotenv from 'dotenv'
dotenv.config()
const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const clientId = process.env.CLIENT_ID

const commands = [
  new SlashCommandBuilder().setName('myprofile').setDescription('Show my userprofile'),
  new SlashCommandBuilder().setName('collection').setDescription('Show my collection'),
  new SlashCommandBuilder().setName('open_booster').setDescription('Open a booster'),
  new SlashCommandBuilder().setName('try_booster').setDescription('Open a booster'),
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
