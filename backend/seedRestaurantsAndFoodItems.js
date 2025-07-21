const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const FoodItem = require('./models/FoodItem');

dotenv.config();

const restaurantNames = [
  "The Golden Spoon", "Taste of Italy", "Spice Route", "Burger Haven", "Sushi Central",
  "The French Bistro", "Mediterranean Delight", "Wok & Roll", "Taco Fiesta", "Healthy Bites",
  "Pizza Palace", "Curry House", "Noodle Bar", "Grill Master", "Vegan Oasis",
  "Seafood Shack", "Deli Delights", "Breakfast Club", "Sweet Treats", "Coffee Corner",
  "The Hungry Robot", "Urban Eats", "Flavor Fusion", "The Daily Grind", "Green Garden Cafe",
  "The Pasta Pot", "Crispy Chicken Co.", "The Donut Den", "Smoothie King", "Juice Bar Express",
  "The Waffle House", "Pancake Paradise", "The Sandwich Spot", "Soup & Salad Bar", "The Kebab King",
  "Chopstick Charlie's", "The Great Indian Kitchen", "Mama Mia's Pizzeria", "El Fuego Mexican Grill",
  "The Sushi Dragon", "The Crepe Corner", "The Smoothie Station", "The Bagel Bistro", "The Cake Shop",
  "The Cookie Jar", "The Ice Cream Parlor", "The Hot Dog Stand", "The Pretzel Place", "The Popcorn Palace"
];

const foodItemsData = [
  { name: "Margherita Pizza", desc: "Classic Italian pizza with tomato, mozzarella, and basil.", cuisine: "Italian", category: "Main Course" },
  { name: "Spaghetti Carbonara", desc: "Creamy pasta with eggs, hard cheese, cured pork, and black pepper.", cuisine: "Italian", category: "Main Course" },
  { name: "Lasagna", desc: "Layers of pasta, rich meat sauce, and béchamel.", cuisine: "Italian", category: "Main Course" },
  { name: "Tiramisu", desc: "Coffee-flavored Italian dessert.", cuisine: "Italian", category: "Dessert" },
  { name: "Chicken Burrito", desc: "Large flour tortilla filled with chicken, rice, beans, and salsa.", cuisine: "Mexican", category: "Main Course" },
  { name: "Beef Tacos", desc: "Crispy or soft tortillas with seasoned beef, lettuce, and cheese.", cuisine: "Mexican", category: "Main Course" },
  { name: "Guacamole & Chips", desc: "Fresh avocado dip served with crispy tortilla chips.", cuisine: "Mexican", category: "Appetizer" },
  { name: "Churros", desc: "Fried dough pastry, often served with chocolate sauce.", cuisine: "Mexican", category: "Dessert" },
  { name: "Butter Chicken", desc: "Creamy tomato-based curry with tender chicken pieces.", cuisine: "Indian", category: "Main Course" },
  { name: "Vegetable Biryani", desc: "Fragrant basmati rice cooked with mixed vegetables and spices.", cuisine: "Indian", category: "Main Course" },
  { name: "Naan Bread", desc: "Soft, leavened flatbread.", cuisine: "Indian", category: "Side Dish" },
  { name: "Samosa", desc: "Crispy pastry filled with spiced potatoes and peas.", cuisine: "Indian", category: "Appetizer" },
  { name: "Kung Pao Chicken", desc: "Spicy, stir-fried Chinese dish with chicken, peanuts, vegetables, and chili peppers.", cuisine: "Chinese", category: "Main Course" },
  { name: "Sweet and Sour Pork", desc: "Crispy pork pieces in a tangy sweet and sour sauce.", cuisine: "Chinese", category: "Main Course" },
  { name: "Fried Rice", desc: "Stir-fried rice with vegetables, egg, and choice of meat.", cuisine: "Chinese", category: "Side Dish" },
  { name: "Spring Rolls", desc: "Crispy fried rolls filled with vegetables.", cuisine: "Chinese", category: "Appetizer" },
  { name: "Salmon Sushi Set", desc: "Assortment of fresh salmon sushi and rolls.", cuisine: "Japanese", category: "Main Course" },
  { name: "Ramen Noodle Soup", desc: "Savory Japanese noodle soup with various toppings.", cuisine: "Japanese", category: "Main Course" },
  { name: "Tempura", desc: "Lightly battered and deep-fried seafood and vegetables.", cuisine: "Japanese", category: "Appetizer" },
  { name: "Mochi", desc: "Japanese rice cake dessert.", cuisine: "Japanese", category: "Dessert" },
  { name: "Classic Cheeseburger", desc: "Beef patty with cheese, lettuce, tomato, and onion on a bun.", cuisine: "American", category: "Main Course" },
  { name: "BBQ Ribs", desc: "Slow-cooked ribs smothered in barbecue sauce.", cuisine: "American", category: "Main Course" },
  { name: "French Fries", desc: "Crispy golden potato fries.", cuisine: "American", category: "Side Dish" },
  { name: "Apple Pie", desc: "Traditional American apple pie.", cuisine: "American", category: "Dessert" },
  { name: "Pad Thai", desc: "Stir-fried rice noodle dish with shrimp or chicken, peanuts, and bean sprouts.", cuisine: "Thai", category: "Main Course" },
  { name: "Green Curry", desc: "Spicy Thai curry with coconut milk, green chilies, and vegetables.", cuisine: "Thai", category: "Main Course" },
  { name: "Tom Yum Soup", desc: "Hot and sour Thai soup with shrimp, mushrooms, and herbs.", cuisine: "Thai", category: "Appetizer" },
  { name: "Mango Sticky Rice", desc: "Sweet sticky rice with fresh mango and coconut milk.", cuisine: "Thai", category: "Dessert" },
  { name: "Chicken Shawarma", desc: "Marinated chicken cooked on a spit, served in a wrap or plate.", cuisine: "Mediterranean", category: "Main Course" },
  { name: "Falafel Wrap", desc: "Fried chickpea patties wrapped in pita bread with vegetables and tahini.", cuisine: "Mediterranean", category: "Main Course" },
  { name: "Hummus Plate", desc: "Creamy chickpea dip served with pita bread.", cuisine: "Mediterranean", category: "Appetizer" },
  { name: "Baklava", desc: "Sweet pastry made of layers of filo filled with chopped nuts and sweetened with syrup.", cuisine: "Mediterranean", category: "Dessert" },
  { name: "Pho Bo", desc: "Vietnamese beef noodle soup.", cuisine: "Vietnamese", category: "Main Course" },
  { name: "Banh Mi", desc: "Vietnamese sandwich with various fillings.", cuisine: "Vietnamese", category: "Main Course" },
  { name: "Fresh Spring Rolls", desc: "Non-fried spring rolls with shrimp, pork, and vegetables.", cuisine: "Vietnamese", category: "Appetizer" },
  { name: "Vietnamese Coffee", desc: "Strong coffee brewed with a small drip filter, served with condensed milk.", cuisine: "Vietnamese", category: "Beverage" },
  { name: "Croissant", desc: "Buttery, flaky French pastry.", cuisine: "French", category: "Appetizer" },
  { name: "Coq au Vin", desc: "French dish of chicken braised with wine, mushrooms, and garlic.", cuisine: "French", category: "Main Course" },
  { name: "Onion Soup", desc: "Classic French onion soup with croutons and melted cheese.", cuisine: "French", category: "Appetizer" },
  { name: "Crème brûlée", desc: "Rich custard base topped with a layer of hardened caramelized sugar.", cuisine: "French", category: "Dessert" },
  { name: "Vegetable Samosa", desc: "Spiced potato and pea filled pastry.", cuisine: "Indian", category: "Appetizer" },
  { name: "Chicken Tikka Masala", desc: "Grilled chicken in a spiced curry sauce.", cuisine: "Indian", category: "Main Course" },
  { name: "Garlic Naan", desc: "Naan bread flavored with garlic.", cuisine: "Indian", category: "Side Dish" },
  { name: "Pani Puri", desc: "Crispy hollow balls filled with spiced potatoes and tangy water.", cuisine: "Indian", category: "Appetizer" },
  { name: "Chicken Korma", desc: "Mild, creamy chicken curry.", cuisine: "Indian", category: "Main Course" },
  { name: "Aloo Gobi", desc: "Dry curry with potatoes and cauliflower.", cuisine: "Indian", category: "Side Dish" },
  { name: "Palak Paneer", desc: "Spinach and cottage cheese curry.", cuisine: "Indian", category: "Main Course" },
  { name: "Dosa", desc: "Thin, crispy pancake made from fermented batter.", cuisine: "Indian", category: "Main Course" },
  { name: "Idli", desc: "Soft, fluffy steamed rice cakes.", cuisine: "Indian", category: "Appetizer" },
  { name: "Vada", desc: "Savory fried lentil doughnuts.", cuisine: "Indian", category: "Appetizer" },
  { name: "Fettuccine Alfredo", desc: "Pasta with a rich, creamy Parmesan cheese sauce.", cuisine: "Italian", category: "Main Course" },
  { name: "Pizza Pepperoni", desc: "Classic pizza topped with pepperoni slices.", cuisine: "Italian", category: "Main Course" },
  { name: "Gnocchi with Pesto", desc: "Potato dumplings with fresh basil pesto.", cuisine: "Italian", category: "Main Course" },
  { name: "Bruschetta", desc: "Toasted bread with tomatoes, garlic, and basil.", cuisine: "Italian", category: "Appetizer" },
  { name: "Minestrone Soup", desc: "Hearty vegetable and pasta soup.", cuisine: "Italian", category: "Appetizer" },
  { name: "Cannoli", desc: "Crispy pastry shells filled with sweet, creamy ricotta cheese.", cuisine: "Italian", category: "Dessert" },
  { name: "Arancini", desc: "Fried rice balls, typically filled with ragù, mozzarella, and peas.", cuisine: "Italian", category: "Appetizer" },
  { name: "Risotto ai Funghi", desc: "Creamy rice dish with mushrooms.", cuisine: "Italian", category: "Main Course" },
  { name: "Caprese Salad", desc: "Fresh mozzarella, tomatoes, and basil.", cuisine: "Italian", category: "Appetizer" },
  { name: "Panna Cotta", desc: "Sweetened cream thickened with gelatin.", cuisine: "Italian", category: "Dessert" },
  { name: "Enchiladas", desc: "Rolled tortillas filled with meat or cheese, topped with chili sauce.", cuisine: "Mexican", category: "Main Course" },
  { name: "Quesadilla", desc: "Tortilla filled with cheese and other ingredients, grilled.", cuisine: "Mexican", category: "Main Course" },
  { name: "Nachos", desc: "Tortilla chips topped with cheese, jalapeños, and salsa.", cuisine: "Mexican", category: "Appetizer" },
  { name: "Fajitas", desc: "Grilled meat served with tortillas and toppings.", cuisine: "Mexican", category: "Main Course" },
  { name: "Tostadas", desc: "Crispy fried tortillas topped with various ingredients.", cuisine: "Mexican", category: "Main Course" },
  { name: "Elote", desc: "Grilled corn on the cob with mayonnaise, cheese, and chili powder.", cuisine: "Mexican", category: "Side Dish" },
  { name: "Tamales", desc: "Masa dough filled with meat or vegetables, steamed in a corn husk.", cuisine: "Mexican", category: "Main Course" },
  { name: "Sopa de Tortilla", desc: "Traditional Mexican tortilla soup.", cuisine: "Mexican", category: "Appetizer" },
  { name: "Horchata", desc: "Sweet rice milk beverage.", cuisine: "Mexican", category: "Beverage" },
  { name: "Flan", desc: "Caramel custard dessert.", cuisine: "Mexican", category: "Dessert" },
  { name: "Peking Duck", desc: "Crispy roasted duck, a classic Chinese dish.", cuisine: "Chinese", category: "Main Course" },
  { name: "Dim Sum Platter", desc: "Assortment of bite-sized Chinese dishes.", cuisine: "Chinese", category: "Appetizer" },
  { name: "Mapo Tofu", desc: "Spicy Szechuan dish with tofu and minced meat.", cuisine: "Chinese", category: "Main Course" },
  { name: "Chow Mein", desc: "Stir-fried noodles with vegetables and meat.", cuisine: "Chinese", category: "Main Course" },
  { name: "Dumplings", desc: "Steamed or fried dumplings with various fillings.", cuisine: "Chinese", category: "Appetizer" },
  { name: "Hot and Sour Soup", desc: "Spicy and tangy Chinese soup.", cuisine: "Chinese", category: "Appetizer" },
  { name: "Egg Drop Soup", desc: "Simple Chinese soup with wisps of beaten egg.", cuisine: "Chinese", category: "Appetizer" },
  { name: "General Tso's Chicken", desc: "Sweet and spicy deep-fried chicken dish.", cuisine: "Chinese", category: "Main Course" },
  { name: "Sesame Chicken", desc: "Crispy chicken with a sweet sesame sauce.", cuisine: "Chinese", category: "Main Course" },
  { name: "Lo Mein", desc: "Soft noodles stir-fried with vegetables and meat.", cuisine: "Chinese", category: "Main Course" },
  { name: "Nigiri Assortment", desc: "Selection of traditional sushi with fish over rice.", cuisine: "Japanese", category: "Main Course" },
  { name: "Dragon Roll", desc: "Sushi roll with eel, avocado, and cucumber.", cuisine: "Japanese", category: "Main Course" },
  { name: "Gyoza", desc: "Pan-fried Japanese dumplings.", cuisine: "Japanese", category: "Appetizer" },
  { name: "Udon Noodle Soup", desc: "Thick wheat flour noodles in a savory broth.", cuisine: "Japanese", category: "Main Course" },
  { name: "Yakitori", desc: "Grilled skewers of chicken.", cuisine: "Japanese", category: "Appetizer" },
  { name: "Edamame", desc: "Steamed green soybeans, lightly salted.", cuisine: "Japanese", category: "Appetizer" },
  { name: "Sashimi Platter", desc: "Assortment of sliced raw fish.", cuisine: "Japanese", category: "Main Course" },
  { name: "Tonkatsu", desc: "Deep-fried breaded pork cutlet.", cuisine: "Japanese", category: "Main Course" },
  { name: "Matcha Ice Cream", desc: "Green tea flavored ice cream.", cuisine: "Japanese", category: "Dessert" },
  { name: "Takoyaki", desc: "Ball-shaped Japanese snack with octopus.", cuisine: "Japanese", category: "Appetizer" },
  { name: "Grilled Chicken Sandwich", desc: "Grilled chicken breast with lettuce, tomato, and mayo.", cuisine: "American", category: "Main Course" },
  { name: "Hot Dog", desc: "Classic hot dog in a bun with toppings.", cuisine: "American", category: "Main Course" },
  { name: "Onion Rings", desc: "Crispy fried onion rings.", cuisine: "American", category: "Side Dish" },
  { name: "Milkshake", desc: "Thick, creamy blended beverage.", cuisine: "American", category: "Beverage" },
  { name: "Caesar Salad", desc: "Romaine lettuce, croutons, Parmesan cheese, and Caesar dressing.", cuisine: "American", category: "Appetizer" },
  { name: "Club Sandwich", desc: "Triple-layered sandwich with turkey, bacon, lettuce, and tomato.", cuisine: "American", category: "Main Course" },
  { name: "Mac and Cheese", desc: "Creamy macaroni and cheese.", cuisine: "American", category: "Side Dish" },
  { name: "Brownie Sundae", desc: "Warm brownie with ice cream, whipped cream, and chocolate sauce.", cuisine: "American", category: "Dessert" },
  { name: "Pancakes with Syrup", desc: "Fluffy pancakes served with maple syrup.", cuisine: "American", category: "Main Course" },
  { name: "Waffles with Berries", desc: "Crispy waffles topped with fresh berries.", cuisine: "American", category: "Main Course" },
  { name: "Tom Kha Gai", desc: "Creamy coconut soup with chicken and galangal.", cuisine: "Thai", category: "Appetizer" },
  { name: "Massaman Curry", desc: "Rich, mild Thai curry with potatoes and peanuts.", cuisine: "Thai", category: "Main Course" },
  { name: "Spring Rolls (Thai)", desc: "Crispy fried rolls with glass noodles and vegetables.", cuisine: "Thai", category: "Appetizer" },
  { name: "Pad See Ew", desc: "Stir-fried wide rice noodles with soy sauce and Chinese broccoli.", cuisine: "Thai", category: "Main Course" },
  { name: "Red Curry", desc: "Spicy Thai curry with red chilies and coconut milk.", cuisine: "Thai", category: "Main Course" },
  { name: "Chicken Satay", desc: "Grilled marinated chicken skewers with peanut sauce.", cuisine: "Thai", category: "Appetizer" },
  { name: "Thai Iced Tea", desc: "Sweet and creamy Thai tea.", cuisine: "Thai", category: "Beverage" },
  { name: "Pineapple Fried Rice", desc: "Fried rice served in a pineapple shell.", cuisine: "Thai", category: "Main Course" },
  { name: "Larb Gai", desc: "Spicy minced chicken salad.", cuisine: "Thai", category: "Appetizer" },
  { name: "Sticky Rice", desc: "Steamed glutinous rice.", cuisine: "Thai", category: "Side Dish" },
  { name: "Chicken Souvlaki", desc: "Grilled chicken skewers, often served in pita.", cuisine: "Mediterranean", category: "Main Course" },
  { name: "Greek Salad", desc: "Salad with tomatoes, cucumbers, olives, and feta cheese.", cuisine: "Mediterranean", category: "Appetizer" },
  { name: "Tzatziki", desc: "Yogurt and cucumber dip.", cuisine: "Mediterranean", category: "Appetizer" },
  { name: "Moussaka", desc: "Layered eggplant and minced meat dish.", cuisine: "Mediterranean", category: "Main Course" },
  { name: "Spanakopita", desc: "Savory spinach and feta pie.", cuisine: "Mediterranean", category: "Appetizer" },
  { name: "Kebab Platter", desc: "Assortment of grilled meat kebabs.", cuisine: "Mediterranean", category: "Main Course" },
  { name: "Lentil Soup", desc: "Hearty and nutritious lentil soup.", cuisine: "Mediterranean", category: "Appetizer" },
  { name: "Dolmades", desc: "Grape leaves stuffed with rice and herbs.", cuisine: "Mediterranean", category: "Appetizer" },
  { name: "Pita Bread", desc: "Soft, flatbread.", cuisine: "Mediterranean", category: "Side Dish" },
  { name: "Greek Yogurt with Honey", desc: "Thick Greek yogurt with honey and nuts.", cuisine: "Mediterranean", category: "Dessert" },
  { name: "Bun Cha", desc: "Grilled pork with vermicelli noodles and herbs.", cuisine: "Vietnamese", category: "Main Course" },
  { name: "Goi Cuon", desc: "Fresh spring rolls with peanut sauce.", cuisine: "Vietnamese", category: "Appetizer" },
  { name: "Com Tam", desc: "Broken rice with grilled pork, egg, and pork chop.", cuisine: "Vietnamese", category: "Main Course" },
  { name: "Banh Xeo", desc: "Crispy Vietnamese pancake.", cuisine: "Vietnamese", category: "Main Course" },
  { name: "Che", desc: "Sweet dessert soup or pudding.", cuisine: "Vietnamese", category: "Dessert" },
  { name: "Ca Phe Sua Da", desc: "Iced Vietnamese coffee with condensed milk.", cuisine: "Vietnamese", category: "Beverage" },
  { name: "Bun Bo Hue", desc: "Spicy Vietnamese beef noodle soup.", cuisine: "Vietnamese", category: "Main Course" },
  { name: "Goi Ga", desc: "Vietnamese chicken salad.", cuisine: "Vietnamese", category: "Appetizer" },
  { name: "Banh Cuon", desc: "Steamed rice rolls with minced pork and mushrooms.", cuisine: "Vietnamese", category: "Appetizer" },
  { name: "Tra Da", desc: "Vietnamese iced tea.", cuisine: "Vietnamese", category: "Beverage" },
  { name: "French Onion Soup", desc: "Classic French soup with caramelized onions and cheese.", cuisine: "French", category: "Appetizer" },
  { name: "Beef Bourguignon", desc: "Beef stew braised in red wine.", cuisine: "French", category: "Main Course" },
  { name: "Escargots de Bourgogne", desc: "Snails baked in garlic butter.", cuisine: "French", category: "Appetizer" },
  { name: "Quiche Lorraine", desc: "Savory tart with bacon and cheese.", cuisine: "French", category: "Main Course" },
  { name: "Ratatouille", desc: "Stewed vegetable dish.", cuisine: "French", category: "Side Dish" },
  { name: "Mousse au Chocolat", desc: "Light and airy chocolate mousse.", cuisine: "French", category: "Dessert" },
  { name: "Confit de Canard", desc: "Duck leg confit.", cuisine: "French", category: "Main Course" },
  { name: "Salade Niçoise", desc: "Salad with tuna, green beans, potatoes, and olives.", cuisine: "French", category: "Appetizer" },
  { name: "Pain au Chocolat", desc: "Chocolate croissant.", cuisine: "French", category: "Appetizer" },
  { name: "Eclairs", desc: "Choux pastry filled with cream and topped with icing.", cuisine: "French", category: "Dessert" },
];

const seedRestaurantsAndFoodItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding restaurants and food items');

    // Clear existing restaurants and food items (optional, for clean seeding)
    await Restaurant.deleteMany({});
    await FoodItem.deleteMany({});
    console.log('Existing restaurants and food items cleared');

    const restaurantsToCreate = 100;
    const foodItemsToCreate = 250; // More than 200

    const createdRestaurants = [];
    const cuisines = ['Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'American', 'Thai', 'Mediterranean', 'Vietnamese', 'French'];
    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish'];

    // Create Restaurants
    for (let i = 0; i < restaurantsToCreate; i++) {
      const randomRestaurantName = restaurantNames[Math.floor(Math.random() * restaurantNames.length)];
      const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];

      const restaurant = new Restaurant({
        name: `${randomRestaurantName} - ${i + 1}`,
        description: `A delicious restaurant offering ${randomCuisine} cuisine.`,
        address: `${Math.floor(Math.random() * 1000) + 1} ${['Main St', 'Oak Ave', 'Elm Rd', 'Pine Ln'][Math.floor(Math.random() * 4)]}, City${Math.floor(Math.random() * 20) + 1}`,
        phone: `+1-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        email: `${randomRestaurantName.toLowerCase().replace(/ /g, '')}${i + 1}@example.com`,
        cuisine: [randomCuisine],
        openingHours: '9 AM - 10 PM',
        imageUrl: `https://source.unsplash.com/random/300x200/?restaurant,food&${i}`,
      });
      await restaurant.save();
      createdRestaurants.push(restaurant);
      console.log(`Created Restaurant: ${restaurant.name}`);
    }

    // Create Food Items
    for (let i = 0; i < foodItemsToCreate; i++) {
      const randomRestaurant = createdRestaurants[Math.floor(Math.random() * createdRestaurants.length)];
      const randomFoodItemData = foodItemsData[Math.floor(Math.random() * foodItemsData.length)];

      const foodItem = new FoodItem({
        name: randomFoodItemData.name,
        description: randomFoodItemData.desc,
        price: parseFloat((Math.random() * (30 - 5) + 5).toFixed(2)),
        category: randomFoodItemData.category,
        imageUrl: `https://source.unsplash.com/random/200x150/?${randomFoodItemData.name.replace(/ /g, ',')},food&${i}`,
        restaurant: randomRestaurant._id,
      });
      await foodItem.save();
      console.log(`Created Food Item: ${foodItem.name} for ${randomRestaurant.name}`);
    }

    console.log('Restaurants and Food Items seeded successfully!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding restaurants and food items:', error);
    process.exit(1);
  }
};

seedRestaurantsAndFoodItems();