const { SlashCommandBuilder } = require("@discordjs/builders")
const { generateDoctorResponse } = require("../ai-service.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("medinfo")
    .setDescription("Get information about medical conditions and treatments")
    .addStringOption((option) =>
      option.setName("topic").setDescription("The medical topic you want to learn about").setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const topic = interaction.options.getString("topic")

    const query = `Provide information about "${topic}". Include symptoms, causes, and general treatment approaches if applicable.`

    try {
      const response = await generateDoctorResponse(query)
      await interaction.editReply(response)
    } catch (error) {
      console.error("Error in medinfo command:", error)
      await interaction.editReply("I encountered an error while retrieving information. Please try again later.")
    }
  },
}

