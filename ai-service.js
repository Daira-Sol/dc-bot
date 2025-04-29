const fetch = require("node-fetch")
const biotechKnowledge = require("./knowledge/biotech.js")
const desciKnowledge = require("./knowledge/desci.js")

// System prompt for the doctor with BioTech and DeSci knowledge
const DOCTOR_PROMPT = `
You are Synapse, an AI Doctor assistant with specialized knowledge about the BioTech computational biology platform and Decentralized Science (DeSci). Your role is to:
1. Answer general medical questions
2. Provide information about common medical conditions
3. Explain medical terminology and concepts
4. Discuss general treatment approaches
5. Provide health education and preventive advice
6. Share detailed information about BioTech and its capabilities when asked
7. Explain DeSci concepts and their importance for scientific research and AI

IMPORTANT: NEVER mention or respond with anything related to "BioFusion". The correct name is "BioTech" for all responses.

Always refer to yourself as "Synapse" when introducing yourself or when asked about your name.

About BioTech:
BioTech is an advanced research platform for computational biology, offering integrated tools for protein analysis, genomic sequencing, and drug discovery. It includes:

1. ProtGPS: A system for protein localization and structure analysis that predicts cellular localization, protein-protein interactions, structural features, and functional annotations.

2. Genomics Analysis Engine: Provides variant detection, expression analysis, pathway enrichment, and structural variant identification.

3. Interactive Visualization Framework: Renders molecular structures and cellular components in real-time 3D.

The platform is built on Next.js, React Three Fiber, and uses Mistral AI. It follows a structured funding roadmap with milestones at $1M (achieved), $2M, $3M, $4M, and $5M levels, each unlocking new capabilities.

BioTech is open source with code available at: https://github.com/BioTech-Ai
Website: https://www.biotech-synapse.xyz/
Twitter: https://x.com/BioTechAi_sol

About DeSci (Decentralized Science):
DeSci is a movement that aims to make scientific research more accessible, transparent, and collaborative by leveraging blockchain technology and decentralized networks. Key components include:

1. Decentralized Funding: Using blockchain and cryptocurrencies to create new funding models for scientific research.

2. Open Access and Data Sharing: Making scientific data, methods, and results freely available to all researchers and the public.

3. Incentive Alignment: Creating economic models that reward scientists for sharing data, reproducing studies, and collaborating.

DeSci has important synergies with AI development, as it can provide more diverse datasets for AI training, ensure transparency of AI models, and enable community governance of scientific AI applications.

Important guidelines:
- NEVER mention "BioFusion" in any response. Always use "BioTech" instead.
- Always include disclaimers when discussing medical information
- Never provide definitive medical diagnoses
- Recommend consulting healthcare professionals for personal medical advice
- Be accurate, helpful, and educational in your responses
- Keep responses concise and focused on medical topics, BioTech information, or DeSci concepts
- When discussing DeSci, mention relevant references from Binance Academy, Binance Research, or other provided sources
`

/**
 * Checks if a query is asking about which AI model is being used
 * @param {string} query - The user's query
 * @returns {boolean} - Whether the query is about the AI model
 */
function isAskingAboutAIModel(query) {
  if (!query) return false

  const lowerQuery = query.toLowerCase()
  return (
    ((lowerQuery.includes("which") || lowerQuery.includes("what")) &&
      (lowerQuery.includes("ai") || lowerQuery.includes("model") || lowerQuery.includes("built with")) &&
      (lowerQuery.includes("using") || lowerQuery.includes("powered by") || lowerQuery.includes("based on"))) ||
    lowerQuery.includes("ai model") ||
    lowerQuery.includes("which model") ||
    lowerQuery.includes("what model") ||
    lowerQuery.includes("which ai") ||
    lowerQuery.includes("what ai") ||
    lowerQuery.includes("what are you built with")
  )
}

/**
 * Checks if a query is asking about who created or developed the bot
 * @param {string} query - The user's query
 * @returns {boolean} - Whether the query is about the bot's creator
 */
function isAskingAboutCreator(query) {
  if (!query) return false

  const lowerQuery = query.toLowerCase()
  return (
    lowerQuery.includes("who develop") ||
    lowerQuery.includes("who created") ||
    lowerQuery.includes("who made") ||
    lowerQuery.includes("who built") ||
    lowerQuery.includes("who is your creator") ||
    lowerQuery.includes("who's your creator") ||
    lowerQuery.includes("who is your developer") ||
    lowerQuery.includes("who's your developer") ||
    lowerQuery.includes("who is your maker") ||
    lowerQuery.includes("who's your maker") ||
    lowerQuery.includes("your creator") ||
    lowerQuery.includes("your developer") ||
    lowerQuery.includes("your maker") ||
    lowerQuery.includes("who programmed you") ||
    lowerQuery.includes("who designed you")
  )
}

/**
 * Checks if a query is asking about the bot's name
 * @param {string} query - The user's query
 * @returns {boolean} - Whether the query is about the bot's name
 */
function isAskingAboutName(query) {
  if (!query) return false

  const lowerQuery = query.toLowerCase()
  return (
    lowerQuery.includes("what is your name") ||
    lowerQuery.includes("what's your name") ||
    lowerQuery.includes("who are you") ||
    lowerQuery.includes("your name") ||
    lowerQuery.includes("what should i call you") ||
    lowerQuery.includes("how should i address you") ||
    lowerQuery.includes("what are you called") ||
    lowerQuery.includes("introduce yourself") ||
    (lowerQuery.includes("what") && lowerQuery.includes("name"))
  )
}

/**
 * Checks if a query is asking about BioFusion
 * @param {string} query - The user's query
 * @returns {boolean} - Whether the query is about BioFusion
 */
function isAskingAboutBioFusion(query) {
  if (!query) return false

  const lowerQuery = query.toLowerCase()
  return lowerQuery.includes("biofusion")
}

/**
 * Try to make a request to the Mistral API with a specific model
 * @param {string} prompt - The system prompt
 * @param {string} query - The user's query
 * @param {string} modelName - The name of the model to use
 * @returns {Promise<string>} - The AI-generated response
 */
async function tryMistralRequest(prompt, query, modelName) {
  try {
    console.log(`Trying Mistral API with model: ${modelName}`)

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: query },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    console.log(`Response status for ${modelName}: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`Error with model ${modelName}:`, JSON.stringify(errorData))
      throw new Error(`Mistral API error with model ${modelName}: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    let response_text = data.choices[0].message.content

    // Replace any instances of "BioFusion" with "BioTech" in the response
    response_text = response_text.replace(/BioFusion/g, "BioTech").replace(/biofusion/g, "BioTech")

    return response_text
  } catch (error) {
    console.error(`Error with model ${modelName}:`, error)
    throw error
  }
}

/**
 * Generates a response to a medical, BioTech, or DeSci query using Mistral AI
 * @param {string} query - The user's query
 * @returns {Promise<string>} - The AI-generated response
 */
async function generateDoctorResponse(query) {
  try {
    // Safety check for empty queries
    if (!query || query.trim() === "") {
      return "I'm Synapse, an AI Doctor designed by Grok AI. How can I assist you today?"
    }

    // Check if the query is asking about the bot's name
    if (isAskingAboutName(query)) {
      return "I am Synapse, an AI Doctor designed by Grok AI to provide information about medical topics, the BioTech computational biology platform, and Decentralized Science (DeSci)."
    }

    // Check if the query is asking about who created or developed the bot
    if (isAskingAboutCreator(query)) {
      return "Synapse designed by Grok AI"
    }

    // Check if the query is asking about which AI model is being used
    if (isAskingAboutAIModel(query)) {
      return "I'm Synapse, built with Grok AI! More developments are in the pipeline to enhance my capabilities and knowledge base. I'm designed to provide information about medical topics, the BioTech computational biology platform, and Decentralized Science (DeSci)."
    }

    // If the query is about BioFusion, redirect to BioTech
    if (isAskingAboutBioFusion(query)) {
      // Replace BioFusion with BioTech in the query
      query = query.replace(/BioFusion/gi, "BioTech")
    }

    // Check if the query is about BioTech
    const isBiotechQuery =
      query.toLowerCase().includes("biotech") ||
      query.toLowerCase().includes("protgps") ||
      query.toLowerCase().includes("protein analysis") ||
      query.toLowerCase().includes("genomic") ||
      query.toLowerCase().includes("computational biology")

    // Check if the query is about DeSci
    const isDesciQuery =
      query.toLowerCase().includes("desci") ||
      query.toLowerCase().includes("decentralized science") ||
      query.toLowerCase().includes("blockchain science") ||
      query.toLowerCase().includes("science dao") ||
      query.toLowerCase().includes("molecule dao")

    // If it's a BioTech query, enhance the prompt with specific details
    let enhancedPrompt = DOCTOR_PROMPT

    if (isBiotechQuery) {
      // Add more specific details based on the query
      if (query.toLowerCase().includes("protgps")) {
        enhancedPrompt += `\n\nDetailed information about ProtGPS:\n${JSON.stringify(biotechKnowledge.coreTechnology.protGPS, null, 2)}`
      } else if (query.toLowerCase().includes("genomic")) {
        enhancedPrompt += `\n\nDetailed information about the Genomics Engine:\n${JSON.stringify(biotechKnowledge.coreTechnology.genomicsEngine, null, 2)}`
      } else if (query.toLowerCase().includes("visualization") || query.toLowerCase().includes("3d")) {
        enhancedPrompt += `\n\nDetailed information about the Visualization Framework:\n${JSON.stringify(biotechKnowledge.coreTechnology.visualization, null, 2)}`
      } else if (query.toLowerCase().includes("funding") || query.toLowerCase().includes("milestone")) {
        enhancedPrompt += `\n\nDetailed information about Funding Milestones:\n${JSON.stringify(biotechKnowledge.fundingMilestones, null, 2)}`
      } else if (query.toLowerCase().includes("future") || query.toLowerCase().includes("roadmap")) {
        enhancedPrompt += `\n\nDetailed information about Future Directions:\n${JSON.stringify(biotechKnowledge.futureDirections, null, 2)}`
      } else if (query.toLowerCase().includes("technical") || query.toLowerCase().includes("architecture")) {
        enhancedPrompt += `\n\nDetailed information about Technical Architecture:\n${JSON.stringify(biotechKnowledge.technicalArchitecture, null, 2)}`
      } else {
        // General BioTech query
        enhancedPrompt += `\n\nGeneral BioTech Overview:\n${JSON.stringify(biotechKnowledge.overview, null, 2)}`
      }
    }

    if (isDesciQuery) {
      // Add more specific details based on the query
      if (
        query.toLowerCase().includes("funding") ||
        query.toLowerCase().includes("dao") ||
        query.toLowerCase().includes("token")
      ) {
        enhancedPrompt += `\n\nDetailed information about Decentralized Funding in DeSci:\n${JSON.stringify(desciKnowledge.keyComponents.decentralizedFunding, null, 2)}`
      } else if (query.toLowerCase().includes("open access") || query.toLowerCase().includes("data sharing")) {
        enhancedPrompt += `\n\nDetailed information about Open Access in DeSci:\n${JSON.stringify(desciKnowledge.keyComponents.openAccess, null, 2)}`
      } else if (query.toLowerCase().includes("incentive") || query.toLowerCase().includes("reward")) {
        enhancedPrompt += `\n\nDetailed information about Incentive Alignment in DeSci:\n${JSON.stringify(desciKnowledge.keyComponents.incentiveAlignment, null, 2)}`
      } else if (query.toLowerCase().includes("ai") || query.toLowerCase().includes("artificial intelligence")) {
        enhancedPrompt += `\n\nDetailed information about DeSci's Relationship with AI:\n${JSON.stringify(desciKnowledge.relationshipWithAI, null, 2)}`
      } else if (query.toLowerCase().includes("biotech") && query.toLowerCase().includes("desci")) {
        enhancedPrompt += `\n\nDetailed information about DeSci's Relevance to BioTech:\n${JSON.stringify(desciKnowledge.relevanceToBioTech, null, 2)}`
      } else {
        // General DeSci query
        enhancedPrompt += `\n\nGeneral DeSci Overview:\n${JSON.stringify(desciKnowledge.overview, null, 2)}`
        enhancedPrompt += `\n\nDeSci References:\n${JSON.stringify(desciKnowledge.references, null, 2)}`
      }
    }

    // Add a final reminder to never mention BioFusion
    enhancedPrompt += "\n\nREMINDER: NEVER mention 'BioFusion' in your response. Always use 'BioTech' instead."

    console.log("Making request to Mistral API with query:", query.substring(0, 50) + "...")

    // Try different models in order of preference
    const models = ["mistral-large-latest", "mistral-large", "mistral-medium", "mistral-small"]

    let lastError = null

    for (const model of models) {
      try {
        let response = await tryMistralRequest(enhancedPrompt, query, model)

        // Double-check for any mentions of BioFusion and replace them
        response = response.replace(/BioFusion/g, "BioTech").replace(/biofusion/g, "BioTech")

        return response
      } catch (error) {
        console.log(`Failed with model ${model}, trying next model if available`)
        lastError = error
        // Continue to the next model
      }
    }

    // If we get here, all models failed
    throw lastError || new Error("All Mistral API models failed")
  } catch (error) {
    // Log the full error details
    console.error("Error generating doctor response:", error.message)
    console.error("Error stack:", error.stack)

    // Return a more specific error message for debugging
    if (error.message.includes("Mistral API error")) {
      throw new Error(`Mistral API error: ${error.message}`)
    } else if (error.message.includes("fetch")) {
      throw new Error(`Network error connecting to Mistral API: ${error.message}`)
    } else {
      throw new Error(`Failed to generate response: ${error.message}`)
    }
  }
}

module.exports = { generateDoctorResponse }

