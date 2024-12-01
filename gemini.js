// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require('dotenv').config()
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const prompt = "Explain how AI works";

// const genrateText=async(prompt)=>{

//     const result = await model.generateContent(prompt);
//     console.log(result.response.text());
// }

// genrateText(prompt);

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const systemPrompt = `You are a Somali e-commerce assistant. Analyze the user's message and categorize it into one of these types:
1. PRODUCT_SEARCH - If they're looking for products to buy
2. COMPANY_INFO - If they're asking about the company
3. GENERAL_CHAT - For greetings or off-topic conversation

For PRODUCT_SEARCH:
- Extract the product name
- Correct any spelling mistakes
- Remove unnecessary words

For COMPANY_INFO:
- Simply return "COMPANY_INFO"

For GENERAL_CHAT:
- Provide a friendly response in Somali

Response format:
{
    "type": "PRODUCT_SEARCH" | "COMPANY_INFO" | "GENERAL_CHAT",
    "productName": "extracted product name" (only for PRODUCT_SEARCH),
    "response": "friendly response" (only for GENERAL_CHAT)
}

Examples:
Input: "Asc waxan raba laptop"
Output: {
    "type": "PRODUCT_SEARCH",
    "productName": "laptop"
}

Input: "niyow ani iyo adi yaa dheer"
Output: {
    "type": "GENERAL_CHAT",
    "response": "Haa walaal, waan kula hadli karaa. Sidee kugu caawin karaa?"
}

Current message: `;


// const generateResponse = async (userMessage) => {
//     const fullPrompt = systemPrompt + userMessage;
    
//     try {
//         const result = await model.generateContent(fullPrompt);
//         const response = await result.response.text();
//         console.log(response);
//         return response;
//     } catch (error) {
//         console.error("Khalad ayaa dhacay:", error);
//         return "Waan ka xunnahay, khalad ayaa dhacay. Fadlan mar kale isku day.";
//     }
// }
// Modify the processMessage function to handle JSON parsing better
async function processMessage(message) {
    try {
        const result = await model.generateContent(systemPrompt + message);
        const response = await result.response.text();
        
        // Clean up the response before parsing
        const cleanResponse = response.replace(/```json\n|\n```/g, '').trim();
        console.log('clean response',cleanResponse)
        return JSON.parse(cleanResponse);
    } catch (error) {
        console.error('Gemini processing error:', error);
        return {
            type: "GENERAL_CHAT",
            response: "Waan ka xunnahay, khalad ayaa dhacay. Fadlan mar kale isku day."
        };
    }
}


// Tusaalayaal
const testMessages = [
    "asc",
    "Waxaan rabaa malaay salmon fish",
    "zxpow waxaan rabaa kabo nike eh ma heli karaa",
    "Imisa ayuu yahay iPhone kii 15?"
];

async function runTests() {
    for (const message of testMessages) {
        console.log("\nFariinta macmiilka:", message);
        await processMessage(message);
    }
}

runTests();


module.exports=processMessage;