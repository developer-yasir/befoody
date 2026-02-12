const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const FoodItem = require('./models/FoodItem');
require('dotenv').config();

const restaurants = [
    {
        name: "Pizza Paradise",
        description: "Authentic Italian pizzas with fresh ingredients",
        cuisine: ["Italian", "Pizza"],
        address: "123 Main St, Downtown",
        phone: "555-0101",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500",
        rating: 4.5,
        deliveryTime: 30,
        deliveryFee: 0,
        isActive: true
    },
    {
        name: "Sushi Master",
        description: "Fresh sushi and Japanese cuisine",
        cuisine: ["Japanese", "Sushi"],
        address: "456 Oak Ave, Midtown",
        phone: "555-0102",
        imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500",
        rating: 4.8,
        deliveryTime: 25,
        deliveryFee: 2.99,
        isActive: true
    },
    {
        name: "Burger House",
        description: "Gourmet burgers and American classics",
        cuisine: ["American", "Burgers"],
        address: "789 Elm St, Uptown",
        phone: "555-0103",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500",
        rating: 4.3,
        deliveryTime: 20,
        deliveryFee: 1.99,
        isActive: true
    },
    {
        name: "Taco Fiesta",
        description: "Authentic Mexican street food",
        cuisine: ["Mexican", "Tacos"],
        address: "321 Pine Rd, Eastside",
        phone: "555-0104",
        imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500",
        rating: 4.6,
        deliveryTime: 35,
        deliveryFee: 0,
        isActive: true
    },
    {
        name: "Curry Palace",
        description: "Traditional Indian curries and tandoor specialties",
        cuisine: ["Indian", "Curry"],
        address: "654 Maple Dr, Westside",
        phone: "555-0105",
        imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500",
        rating: 4.7,
        deliveryTime: 40,
        deliveryFee: 2.49,
        isActive: true
    },
    {
        name: "Noodle Express",
        description: "Quick and delicious Asian noodles",
        cuisine: ["Chinese", "Noodles"],
        address: "987 Cedar Ln, Southside",
        phone: "555-0106",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
        rating: 4.4,
        deliveryTime: 15,
        deliveryFee: 1.49,
        isActive: true
    }
];

const foodItemsByRestaurant = {
    "Pizza Paradise": [
        { name: "Margherita Pizza", description: "Classic tomato, mozzarella, and basil", price: 12.99, category: "Pizza", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400" },
        { name: "Pepperoni Pizza", description: "Loaded with pepperoni and cheese", price: 14.99, category: "Pizza", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400" },
        { name: "Vegetarian Supreme", description: "Bell peppers, onions, mushrooms, olives", price: 13.99, category: "Pizza", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400" },
        { name: "Garlic Bread", description: "Crispy bread with garlic butter", price: 5.99, category: "Sides", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1573140401552-3fab0b24f2f6?w=400" }
    ],
    "Sushi Master": [
        { name: "California Roll", description: "Crab, avocado, cucumber", price: 8.99, category: "Rolls", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400" },
        { name: "Salmon Nigiri", description: "Fresh salmon over rice (6 pieces)", price: 12.99, category: "Nigiri", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400" },
        { name: "Spicy Tuna Roll", description: "Spicy tuna with cucumber", price: 10.99, category: "Rolls", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400" },
        { name: "Vegetable Tempura", description: "Crispy fried vegetables", price: 7.99, category: "Appetizers", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400" },
        { name: "Miso Soup", description: "Traditional Japanese soup", price: 3.99, category: "Soup", isVegetarian: true, isVegan: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400" }
    ],
    "Burger House": [
        { name: "Classic Cheeseburger", description: "Beef patty with cheese, lettuce, tomato", price: 9.99, category: "Burgers", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
        { name: "Bacon BBQ Burger", description: "Bacon, BBQ sauce, onion rings", price: 11.99, category: "Burgers", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400" },
        { name: "Veggie Burger", description: "Plant-based patty with all the fixings", price: 10.99, category: "Burgers", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400" },
        { name: "French Fries", description: "Crispy golden fries", price: 4.99, category: "Sides", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
        { name: "Onion Rings", description: "Crispy battered onion rings", price: 5.99, category: "Sides", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400" }
    ],
    "Taco Fiesta": [
        { name: "Beef Tacos", description: "Seasoned beef with fresh toppings (3 pcs)", price: 8.99, category: "Tacos", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400" },
        { name: "Chicken Quesadilla", description: "Grilled chicken and cheese", price: 9.99, category: "Quesadillas", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400" },
        { name: "Vegetarian Burrito", description: "Rice, beans, veggies, cheese", price: 10.99, category: "Burritos", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400" },
        { name: "Guacamole & Chips", description: "Fresh guacamole with tortilla chips", price: 6.99, category: "Appetizers", isVegetarian: true, isVegan: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400" },
        { name: "Fish Tacos", description: "Grilled fish with cabbage slaw (3 pcs)", price: 11.99, category: "Tacos", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400" }
    ],
    "Curry Palace": [
        { name: "Chicken Tikka Masala", description: "Creamy tomato curry with tender chicken", price: 13.99, category: "Curry", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400" },
        { name: "Vegetable Biryani", description: "Fragrant rice with mixed vegetables", price: 11.99, category: "Rice", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Palak Paneer", description: "Spinach curry with cottage cheese", price: 12.99, category: "Curry", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
        { name: "Garlic Naan", description: "Soft flatbread with garlic", price: 3.99, category: "Bread", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
        { name: "Samosas", description: "Crispy pastry with spiced potatoes (4 pcs)", price: 5.99, category: "Appetizers", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" }
    ],
    "Noodle Express": [
        { name: "Pad Thai", description: "Stir-fried rice noodles with peanuts", price: 10.99, category: "Noodles", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400" },
        { name: "Lo Mein", description: "Soft noodles with vegetables and sauce", price: 9.99, category: "Noodles", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400" },
        { name: "Beef Chow Mein", description: "Crispy noodles with beef and veggies", price: 11.99, category: "Noodles", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400" },
        { name: "Spring Rolls", description: "Crispy vegetable rolls (4 pcs)", price: 5.99, category: "Appetizers", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400" },
        { name: "Fried Rice", description: "Wok-fried rice with egg and vegetables", price: 8.99, category: "Rice", isVegetarian: true, isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400" }
    ]
};

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get admin user to use as restaurant owner
        const User = require('./models/User');
        const adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.error('❌ No admin user found. Please run createAdmin.js first.');
            process.exit(1);
        }

        console.log(`👤 Using admin user: ${adminUser.email}`);

        // Clear existing data
        await Restaurant.deleteMany({});
        await FoodItem.deleteMany({});
        console.log('🗑️  Cleared existing restaurants and food items');

        let totalRestaurants = 0;
        let totalFoodItems = 0;

        // Insert restaurants and their food items
        for (const restaurantData of restaurants) {
            const restaurant = await Restaurant.create({
                ...restaurantData,
                ownerId: adminUser._id
            });
            totalRestaurants++;
            console.log(`✅ Created restaurant: ${restaurant.name}`);

            const foodItems = foodItemsByRestaurant[restaurant.name];
            if (foodItems) {
                for (const foodItemData of foodItems) {
                    await FoodItem.create({
                        ...foodItemData,
                        restaurantId: restaurant._id
                    });
                    totalFoodItems++;
                }
                console.log(`   📦 Added ${foodItems.length} food items`);
            }
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('-----------------------------------');
        console.log(`📍 Total Restaurants: ${totalRestaurants}`);
        console.log(`🍔 Total Food Items: ${totalFoodItems}`);
        console.log('-----------------------------------');
        console.log('You can now browse restaurants at http://localhost:5173');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
