const { Client, Intents, Collection } = require("discord.js")
const fs = require("fs")
const path = require("path")
const express = require("express")
require("dotenv").config()

// Create a new client instance with the correct intents for discord.js v13
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  partials: ["CHANNEL"], // Needed for DM events
})

// Import AI service
const { generateDoctorResponse } = require("./ai-service.js")

/**
 * Function to filter out any mentions of BioFusion from responses
 * @param {string} text - The text to filter
 * @returns {string} - The filtered text
 */
function filterBioFusionMentions(text) {
  if (!text) return text
  return text.replace(/BioFusion/g, "BioTech").replace(/biofusion/g, "BioTech")
}

// Set up commands collection
client.commands = new Collection()
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user.tag}`)
  console.log(`Synapse is in ${client.guilds.cache.size} servers`)
})

// Handle interactions (slash commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return

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
client.on("messageCreate", async (message) => {
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

      console.log(`Processing message: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`)

      // Generate response using AI
      let response = await generateDoctorResponse(content)

      // Apply an additional filter to ensure no BioFusion mentions
      response = filterBioFusionMentions(response)

      // Send the response
      await message.reply(response)
    } catch (error) {
      console.error("Error generating response:", error.message)

      // Check for specific error types and provide more helpful responses
      if (error.message.includes("Mistral API error: 401")) {
        await message.reply("I encountered an authentication error. Please check the Mistral API key configuration.")
      } else if (error.message.includes("Mistral API error: 429")) {
        await message.reply("I've reached my rate limit with the AI service. Please try again in a few minutes.")
      } else if (error.message.includes("Network error")) {
        await message.reply(
          "I'm having trouble connecting to my AI service. Please check your internet connection and try again.",
        )
      } else {
        await message.reply("I encountered an error while processing your request. Please try again later.")
      }
    }
  }
})

// Add simple test commands
client.on("messageCreate", (message) => {
  // Ignore messages from bots
  if (message.author.bot) return

  // Simple test commands that don't use the AI service
  if (message.content.toLowerCase() === "!ping") {
    message.reply("Pong! I am Synapse, online and working!")
  } else if (message.content.toLowerCase() === "!info") {
    message.reply(`
Bot Information:
- Name: Synapse
- Connected to: ${client.guilds.cache.size} servers
- Designed by: Grok AI
- Status: Online
- Commands: /interpret, /medinfo, /biotech, /desci
    `)
  }
})

// Keep the bot alive with a simple HTTP server
const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.send("Synapse is running!")
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error("Failed to login to Discord:", error)
})

// Handle process termination
process.on("SIGINT", () => {
  console.log("Bot is shutting down...")
  client.destroy()
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("Bot is shutting down...")
  client.destroy()
  process.exit(0)
})

