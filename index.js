// Require the necessary discord.js classes
const { Client, Intents, MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js')
require('dotenv').config()
const token = process.env.DISCORD_TOKEN
const guildId = process.env.GUILD_ID

const colpkg = require('./colmgr.js')
const { getSetBooster, setExists } = require('./boosterBuilder.js')

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

let col
// When the client is ready, run this code (only once)
client.once('ready', async () => {
  col = await colpkg.initDb('data/' + guildId + '.db')
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
      try {
        col.createUserProfile(interaction.user.id)
        user = col.getUserProfile(interaction.user.id)
        console.log('created new User Profile')
      } catch (err) {
        console.error(err)
      }
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
    if (interaction.member.permissions.has('ADMINISTRATOR')) {
      await col.addBoosterPointsToAll(interaction.options.getInteger('boosterpoints'))
      await interaction.reply('Booster Points added')
    } else {
      await interaction.reply('Only Admin can award points')
    }
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return
  if (interaction.customId === 'try_booster') {
    openBooster(interaction, false)
  } else if (interaction.customId === 'open_booster') {
    openBooster(interaction, true)
  }
  async function openBooster (interaction, addToCollection) {
    const setId = interaction.values[0]
    let content = 'ERROR'
    if (setExists(setId)) {
      const newCards = getSetBooster(setId).map(c => c.name)
      content = 'Booster Content\n\n' +
                        newCards.join('\n')
      if (addToCollection) {
        if (!col.tryAddBoosterCards(interaction.user.id, newCards)) {
          content = 'sorry, no more bosterpoints ' + interaction.user.username
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

async function buildSetSelector (interaction, id) {
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
