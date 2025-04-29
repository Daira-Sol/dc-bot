const { SlashCommandBuilder } = require("@discordjs/builders")
const { generateDoctorResponse } = require("../ai-service.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("desci")
    .setDescription("Get information about Decentralized Science (DeSci) and its importance")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("The specific aspect of DeSci you want to learn about")
        .setRequired(true)
        .addChoice("Overview", "overview")
        .addChoice("Decentralized Funding", "funding")
        .addChoice("Open Access", "openaccess")
        .addChoice("Incentive Alignment", "incentives")
        .addChoice("Relationship with AI", "ai")
        .addChoice("Relevance to BioTech", "biotech")
        .addChoice("References", "references"),
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const topic = interaction.options.getString("topic")

    let query = ""
    switch (topic) {
      case "overview":
        query = "What is Decentralized Science (DeSci)? Give me an overview of its key concepts and importance."
        break
      case "funding":
        query =
          "Explain how decentralized funding works in DeSci. What are some examples of decentralized funding for scientific research?"
        break
      case "openaccess":
        query = "How does DeSci promote open access and data sharing in scientific research?"
        break
      case "incentives":
        query = "Explain incentive alignment in DeSci. How does it create better incentives for scientists?"
        break
      case "ai":
        query = "What is the relationship between DeSci and AI? How do they complement each other?"
        break
      case "biotech":
        query = "How is DeSci relevant to the BioTech platform? What connections exist between them?"
        break
      case "references":
        query = "Provide references and resources for learning more about DeSci."
        break
      default:
        query = "What is Decentralized Science (DeSci) and why is it important?"
    }

    try {
      const response = await generateDoctorResponse(query)
      await interaction.editReply(response)
    } catch (error) {
      console.error("Error in desci command:", error)
      await interaction.editReply(
        "I encountered an error while retrieving information about DeSci. Please try again later.",
      )
    }
  },
}

