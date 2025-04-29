const { SlashCommandBuilder } = require("@discordjs/builders")
const { generateDoctorResponse } = require("../ai-service.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("biotech")
    .setDescription("Get information about the BioTech computational biology platform")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("The specific aspect of BioTech you want to learn about")
        .setRequired(true)
        .addChoice("Overview", "overview")
        .addChoice("ProtGPS", "protgps")
        .addChoice("Genomics Engine", "genomics")
        .addChoice("Visualization", "visualization")
        .addChoice("Technical Architecture", "architecture")
        .addChoice("Funding Milestones", "funding")
        .addChoice("Future Directions", "future"),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const topic = interaction.options.getString("topic")

    let query = ""
    switch (topic) {
      case "overview":
        query = "Give me an overview of the BioTech platform. What is it and what does it do?"
        break
      case "protgps":
        query = "Explain the ProtGPS component of BioTech. What capabilities does it have for protein analysis?"
        break
      case "genomics":
        query =
          "Tell me about the Genomics Analysis Engine in BioTech. What genomic analysis capabilities does it offer?"
        break
      case "visualization":
        query =
          "Describe the Interactive Visualization Framework in BioTech. How does it help researchers visualize molecular structures?"
        break
      case "architecture":
        query =
          "What is the technical architecture of BioTech? What technologies does it use for frontend, backend, and AI models?"
        break
      case "funding":
        query = "Explain the funding milestones for BioTech. What features are planned at each funding level?"
        break
      case "future":
        query = "What are the future research directions for BioTech? What new capabilities are planned?"
        break
      default:
        query = "Tell me about the BioTech computational biology platform."
    }

    try {
      const response = await generateDoctorResponse(query)
      await interaction.editReply(response)
    } catch (error) {
      console.error("Error in biotech command:", error)
      await interaction.editReply(
        "I encountered an error while retrieving information about BioTech. Please try again later.",
      )
    }
  },
}

