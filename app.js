const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const processMessage = require('./gemini');
const { populateDatabase } = require('./sampleData');
const product = require('./model/product');



// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
// populateDatabase()
// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "ecommerce-app"
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});


// Translation map for common Somali shopping terms
const somaliToEnglishMap = {
    'kabo': ['shoes', 'footwear'],
    'shaati': ['shirt', 't-shirt'],
    'surwaal': ['pants', 'trousers'],
    'garan': ['dress'],
    'kabaha': ['shoes'],
    'dhar': ['clothes', 'clothing'],
    'malaay': ['fish'],
    'hilib': ['meat'],
    'bariis': ['rice'],
    // Add more mappings as needed
};

const brandKeywords = ['nike', 'adidas', 'puma', 'gucci', 'apple', 'samsung']; // Add more brands

// Enhanced search function
async function searchProducts(query) {
    try {
        // 1. Normalize and split the query
        const words = query.toLowerCase().trim().split(/\s+/);
        
        // 2. Process each word through the translation map
        let searchTerms = [];
        let brandTerms = [];
        
        for (const word of words) {
            // Check if it's a brand
            if (brandKeywords.includes(word.toLowerCase())) {
                brandTerms.push(word.toLowerCase());
                continue;
            }
            
            // Check for Somali translations
            if (somaliToEnglishMap[word]) {
                searchTerms.push(...somaliToEnglishMap[word]);
            } else {
                searchTerms.push(word);
            }
        }
        
        // 3. Build the search query
        const searchQuery = {
            $and: [
                {
                    $or: [
                        { name: { $regex: searchTerms.join('|'), $options: 'i' } },
                        { description: { $regex: searchTerms.join('|'), $options: 'i' } },
                        { category: { $regex: searchTerms.join('|'), $options: 'i' } },
                        { keywords: { $in: searchTerms } },
                        { somaliKeywords: { $in: words } },      // Original Somali words
                        { englishKeywords: { $in: searchTerms } } // Translated English words
                    ]
                }
            ]
        };
        
        // Add brand filter if brand terms exist
        if (brandTerms.length > 0) {
            searchQuery.$and.push({
                $or: [
                    { brand: { $in: brandTerms } },
                    { name: { $regex: brandTerms.join('|'), $options: 'i' } }
                ]
            });
        }

        // 4. Execute search with scoring
        const products = await product.aggregate([
            { $match: searchQuery },
            { 
                $addFields: {
                    searchScore: {
                        $add: [
                            { $cond: [{ $regexMatch: { input: "$name", regex: new RegExp(searchTerms.join('|'), 'i') } }, 3, 0] },
                            { $cond: [{ $regexMatch: { input: "$brand", regex: new RegExp(brandTerms.join('|'), 'i') } }, 2, 0] },
                            { $cond: [{ $regexMatch: { input: "$category", regex: new RegExp(searchTerms.join('|'), 'i') } }, 1, 0] }
                        ]
                    }
                }
            },
            { $sort: { searchScore: -1 } },
            { $limit: 5 }
        ]);

        return products;
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// Simplify the formatProductMessage function
async function formatProductMessage(product) {
    try {
        let media;
        try {
            media = await MessageMedia.fromUrl(product.imageUrl, {
                unsafeMime: true
            });
        } catch (imageError) {
            console.error('Image loading error:', imageError);
            media = null;
        }

        const messageText = `*${product.name}*\n${product.description}\nPrice: $${product.price}`;
        return { media, messageText };
    } catch (error) {
        console.error('Error formatting product:', error);
        return {
            media: null,
            messageText: `*${product.name}*\n${product.description}\nPrice: $${product.price}`
        };
    }
}

// Handle user messages
client.on('message', async msg => {
    console.log('Received message from:', msg.from);
    try {
        const chat = await msg.getChat();
        // console.log('chat',chat)
        
        if (msg.body.startsWith('!search ')) {
            const query = msg.body.slice(8);
            console.log('how query would look',uery);
            const products = await searchProducts(query);
            
            if (products.length === 0) {
                await msg.reply('No products found. Try a different search term.');
                return;
            }

            // Send first product
            const firstProduct = products[0];
            const formattedProduct = await formatProductMessage(firstProduct);
            
            try {
                if (formattedProduct.media) {
                    // Send image with caption
                    await chat.sendMessage(formattedProduct.media, {
                        caption: formattedProduct.messageText
                    });
                } else {
                    // Send text only if no image
                    await msg.reply(formattedProduct.messageText);
                }
            } catch (sendError) {
                console.error('Error sending message:', sendError);
                await msg.reply(formattedProduct.messageText);
            }
        }
        else if (msg.body === '!help') {
            const helpMessage = `
Welcome to our E-commerce Bot!

Available commands:
• !search [product] - Search for products
• !categories - View product categories
• !cart - View your shopping cart
• !help - Show this help message

Example: !search shoes
            `;
            await msg.reply(helpMessage);
        }else{
            const promt_repsons =await processMessage(msg.body);
            console.log('thi is it',promt_repsons);
            if(promt_repsons.type==='GENERAL_CHAT'){
                await msg.reply(promt_repsons.response)
            }
            else if(promt_repsons.type==='PRODUCT_SEARCH'){
                const product_Result=await searchProducts(promt_repsons.productName)
                console.log(product_Result)
                for(let i=0; i<product_Result.length; i++ ){
                    console.log(product_Result)
                    const formattedProduct = await formatProductMessage(product_Result[i]);
                    try {
                        if (formattedProduct.media) {
                            // Send image with caption
                            await chat.sendMessage(formattedProduct.media, {
                                caption: formattedProduct.messageText
                            });
                        } else {
                            // Send text only if no image
                            await msg.reply(formattedProduct.messageText);
                        }
                    } catch (sendError) {
                        console.error('Error sending message:', sendError);
                        await msg.reply(formattedProduct.messageText);
                    }
                }

            }
        }
    } catch (error) {
        console.error('Message handling error:', error);
        await msg.reply('Sorry, there was an error processing your request. Please try again.');
    }
});

// Message_create event - triggers for all messages including bot's messages
// client.on('message_create', async msg => {
//     // Check if message is from the bot itself
//     const isFromMe = msg.fromMe;
//     console.log(`Message ${isFromMe ? 'from bot' : 'from user'}:`, msg.body);
// });

// Client events
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code generated');
});

client.on('ready', () => {
    console.log('E-commerce bot is ready!');
});

// Error handling for client
client.on('auth_failure', msg => {
    console.error('Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

// Initialize client
client.initialize().catch(err => {
    console.error('Failed to initialize client:', err);
});