const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    category: String
});

const Product = mongoose.model('Product', productSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce').then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

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

// Handle product search
async function searchProducts(query) {
    try {
        return await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).limit(5);
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
        console.log('chat',chat)
        
        if (msg.body.startsWith('!search ')) {
            const query = msg.body.slice(8);
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
        }
    } catch (error) {
        console.error('Message handling error:', error);
        await msg.reply('Sorry, there was an error processing your request. Please try again.');
    }
});

// Message_create event - triggers for all messages including bot's messages
client.on('message_create', async msg => {
    // Check if message is from the bot itself
    const isFromMe = msg.fromMe;
    console.log(`Message ${isFromMe ? 'from bot' : 'from user'}:`, msg.body);
});

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