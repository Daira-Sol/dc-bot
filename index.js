import { Client, GatewayIntentBits, Events, Collection } from "discord.js"
import { config } from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { generateDoctorResponse } from "./ai-service.js"

// Load environment variables
config()

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

// Set up commands collection
client.commands = new Collection()

// Get the directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const commandsPath = path.join(__dirname, "commands")

// Load command files
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = await import(filePath)

  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

// Handle interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true })
    } else {
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
    }
  }
})

// Handle regular messages
client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return

  // Check if the message mentions the bot or is in a DM
  const isMentioned = message.mentions.has(client.user.id)
  const isDM = message.channel.type === "DM"

  if (isMentioned || isDM) {
    // Show typing indicator
    await message.channel.sendTyping()

    try {
      // Get the message content without the mention
      let content = message.content
      if (isMentioned) {
        content = content.replace(new RegExp(`<@!?${client.user.id}>`), "").trim()
      }

      // Generate response using AI
      const response = await generateDoctorResponse(content)

      // Send the response
      await message.reply(response)
    } catch (error) {
      console.error("Error generating response:", error)
      await message.reply("I encountered an error while processing your request. Please try again later.")
    }
  }
})

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)

