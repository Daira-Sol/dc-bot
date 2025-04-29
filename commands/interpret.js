const { SlashCommandBuilder } = require("@discordjs/builders")
const { generateDoctorResponse } = require("../ai-service.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("interpret")
    .setDescription("Get help interpreting medical test results")
    .addStringOption((option) =>
      option
        .setName("test")
        .setDescription("The type of medical test")
        .setRequired(true)
        .addChoice("Complete Blood Count (CBC)", "cbc")
        .addChoice("Basic Metabolic Panel (BMP)", "bmp")
        .addChoice("Lipid Panel", "lipid")
        .addChoice("Liver Function Tests", "liver")
        .addChoice("Thyroid Function Tests", "thyroid")
        .addChoice("Other", "other"),
    )
    .addStringOption((option) =>
      option
        .setName("values")
        .setDescription("The test values you want to understand (format: test:value, test:value)")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const testType = interaction.options.getString("test")
    const values = interaction.options.getString("values")

    const query = `Help me understand these ${testType} test results: ${values}`

    try {
      const response = await generateDoctorResponse(query)
      await interaction.editReply(response)
    } catch (error) {
      console.error("Error in interpret command:", error)
      await interaction.editReply("I encountered an error while interpreting the test results. Please try again later.")
    }
  },
}

