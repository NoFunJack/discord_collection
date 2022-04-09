// Require the necessary discord.js classes
import { MessageComponentInteraction,Client, Intents, MessageActionRow, Interaction, CacheType, MessageSelectMenu, SelectMenuInteraction, CommandInteraction, GuildMember } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()
import {initDb, Collection} from './modules/colmgr.js'
import {getScryFallBuilder} from './modules/boosterBuilder'

const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID
const boosterBuilder = getScryFallBuilder()


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

let col: Collection
// When the client is ready, run this code (only once)
client.once('ready', async () => {
  col = await initDb('data/' + guildId + '.db')
  console.log('Ready!')
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return

  const { commandName } = interaction

  console.log('Command /' + commandName + ' from ' + interaction.user.username)

  if (commandName === 'myprofile') {
    let user
    try {
      user = col.getUserProfile(interaction.user.id)
    } catch (err) {
      col.createUserProfile(interaction.user.id)
      user = col.getUserProfile(interaction.user.id)
      console.log('created new User Profile')
    }

    await interaction.reply('you have ' + user.boosterPoints + ' Boosterpoints!')
  } else if (commandName === 'try_booster') {
    await buildSetSelector(interaction, 'try_booster')
  } else if (commandName === 'open_booster') {
    await buildSetSelector(interaction, 'open_booster')
  } else if (commandName === 'collection') {
    const list = col.getCardsTxt(interaction.user.id)
    if (list) {
      await interaction.reply({
        files: [{
          attachment: Buffer.from(list, 'utf-8'),
          name: 'collection of ' + interaction.user.username + '.txt'
        }]
      })
    } else {
      await interaction.reply('none found')
    }
  } else if (commandName === 'award_all_players') {
    const member = interaction.member as GuildMember;
    if (member.permissions.has("ADMINISTRATOR")) {
      const points =  interaction.options.getInteger('boosterpoints')
      if(points != null){
        await col.addBoosterPointsToAll(points)
        await interaction.reply('Booster Points added')
      } else {
        throw new Error('no booster points parameter found')
      }
    } else {
      await interaction.reply('Only Admin can award points')
    }
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  const values = interaction.values[0]
  if (interaction.customId === 'try_booster') {
    openBooster(interaction, values, false)
  } else if (interaction.customId === 'open_booster') {
    openBooster(interaction, values, true)
  }
  async function openBooster (interaction: SelectMenuInteraction ,setId: string, addToCollection: boolean) {
    let content = 'ERROR'
    if (boosterBuilder.setExists(setId)) {
      const newCards = boosterBuilder.getSetBooster(setId).map(c => c.name)
      content = 'Booster Content\n\n' +
                        newCards.join('\n')
      if (addToCollection) {
        if (!await col.tryAddBoosterCards(interaction.user.id, newCards)) {
          content = 'sorry, no more bosterpoints ' + interaction.user.username
          console.log(content)
        }
      }
    } else {
      content = 'set "' + setId + '" not found'
    }
    await interaction.update({ content: content, components: [] })
  }
})

// Login to Discord with your client's token
client.login(token)

process.on('SIGINT', () => {
  console.info('SIGTERM signal received.')
  client.destroy()
  console.info('bot logged out')
  process.exit(0)
})

async function buildSetSelector (interaction: CommandInteraction, id: string) {
  const row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId(id)
        .setPlaceholder('Nothing selected')
        .addOptions([
          {
            label: 'Kamigawa: Neon Dynasty',
            // description: 'This is a description',
            value: 'neo'
          },
          {
            label: 'Innistrad: Crimson Vow',
            value: 'vow'
          },
          {
            label: 'Innistrad: Midnight Hunt',
            value: 'mid'
          }
        ])
    )

  await interaction.reply({ content: 'Select Set', components: [row] })
}
