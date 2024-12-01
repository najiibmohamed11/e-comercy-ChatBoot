const product = require("./model/product");

const sampleProducts = [
    {
        name: "Nike Air Max Running Shoes",
        description: "Comfortable running shoes with air cushioning technology",
        price: 89.99,
        imageUrl: "https://example.com/nike-air-max.jpg",
        category: "Shoes",
        brand: "Nike",
        keywords: ["shoes", "running", "sneakers", "nike", "air max", "sports"],
        somaliKeywords: ["kabo", "kabaha", "kabo orad", "nike"],
        englishKeywords: ["shoes", "running shoes", "sneakers", "nike shoes", "sports shoes"],
        tags: ["athletic", "footwear", "running", "sports"]
    },
    {
        name: "Traditional Somali Dirac Dress",
        description: "Beautiful traditional Somali dress with elegant embroidery",
        price: 65.00,
        imageUrl: "https://example.com/dirac.jpg",
        category: "Clothing",
        brand: "Traditional",
        keywords: ["dress", "dirac", "traditional", "clothing", "women"],
        somaliKeywords: ["dirac", "dhar", "garan", "dhar dumarka"],
        englishKeywords: ["dress", "traditional dress", "womens clothing"],
        tags: ["traditional", "women", "formal", "cultural"]
    },
    {
        name: "Samsung Galaxy S23 Ultra",
        description: "Latest Samsung flagship smartphone with 108MP camera",
        price: 999.99,
        imageUrl: "https://example.com/samsung-s23.jpg",
        category: "Electronics",
        brand: "Samsung",
        keywords: ["phone", "smartphone", "samsung", "galaxy", "mobile"],
        somaliKeywords: ["telefoon", "mobilka", "samsung"],
        englishKeywords: ["phone", "smartphone", "mobile", "samsung phone"],
        tags: ["electronics", "smartphone", "premium"]
    },
    {
        name: "Fresh Salmon Fish",
        description: "Premium fresh salmon, perfect for grilling",
        price: 12.99,
        imageUrl: "https://example.com/salmon.jpg",
        category: "Food",
        brand: "Fresh Catch",
        keywords: ["fish", "salmon", "seafood", "fresh", "food"],
        somaliKeywords: ["malaay", "kalluun", "salmon"],
        englishKeywords: ["fish", "salmon", "seafood"],
        tags: ["fresh", "seafood", "grocery"]
    },
    {
        name: "Adidas Track Suit",
        description: "Comfortable sports tracksuit for men",
        price: 75.00,
        imageUrl: "https://example.com/adidas-track.jpg",
        category: "Clothing",
        brand: "Adidas",
        keywords: ["tracksuit", "sports", "adidas", "suit", "men"],
        somaliKeywords: ["dhar", "dhar isborti", "adidas"],
        englishKeywords: ["tracksuit", "sports wear", "athletic wear"],
        tags: ["sports", "menswear", "athletic"]
    },
    {
        name: "Basmati Rice 5kg",
        description: "Premium quality basmati rice",
        price: 18.99,
        imageUrl: "https://example.com/rice.jpg",
        category: "Food",
        brand: "Royal",
        keywords: ["rice", "basmati", "food", "grain"],
        somaliKeywords: ["bariis", "bariis basmati"],
        englishKeywords: ["rice", "basmati rice", "grain"],
        tags: ["grocery", "staples", "cooking"]
    },
    {
        name: "iPhone 14 Pro",
        description: "Apple's flagship phone with advanced camera system",
        price: 999.99,
        imageUrl: "https://example.com/iphone14.jpg",
        category: "Electronics",
        brand: "Apple",
        keywords: ["phone", "iphone", "apple", "smartphone"],
        somaliKeywords: ["telefoon", "mobilka", "iphone"],
        englishKeywords: ["phone", "iphone", "smartphone", "apple phone"],
        tags: ["electronics", "premium", "smartphone"]
    },
    {
        name: "Traditional Somali Baati",
        description: "Comfortable everyday traditional dress",
        price: 35.00,
        imageUrl: "https://example.com/baati.jpg",
        category: "Clothing",
        brand: "Traditional",
        keywords: ["dress", "baati", "traditional", "women"],
        somaliKeywords: ["baati", "dhar", "dhar dumarka"],
        englishKeywords: ["dress", "traditional dress", "house dress"],
        tags: ["traditional", "women", "casual"]
    },
    {
        name: "Men's Casual Shirt",
        description: "Cotton casual shirt for men",
        price: 29.99,
        imageUrl: "https://example.com/shirt.jpg",
        category: "Clothing",
        brand: "Generic",
        keywords: ["shirt", "casual", "men", "cotton"],
        somaliKeywords: ["shaati", "dhar", "shaati ragga"],
        englishKeywords: ["shirt", "mens shirt", "casual shirt"],
        tags: ["menswear", "casual", "tops"]
    },
    {
        name: "Camel Milk Fresh 1L",
        description: "Fresh camel milk from local farms",
        price: 8.99,
        imageUrl: "https://www.yemoos.com/cdn/shop/articles/camel_kefir_692x.jpg?v=1561322713",
        category: "Food",
        brand: "Local Farm",
        keywords: ["milk", "camel", "dairy", "fresh"],
        somaliKeywords: ["caano", "caano geel"],
        englishKeywords: ["milk", "camel milk", "dairy"],
        tags: ["dairy", "fresh", "traditional"]
    }
];

// Function to populate the database with sample products
async function populateDatabase() {
    try {
        // Clear existing products
        await product.deleteMany({});
        
        // Insert new products
        const result = await product.insertMany(sampleProducts);
        
        console.log(`Successfully inserted ${result.length} products`);
        return result;
    } catch (error) {
        console.error('Error populating database:', error);
        throw error;
    }
}

// Export the function and sample data
module.exports = {
    sampleProducts,
    populateDatabase
};