# 🍔 Befoody - Food Delivery Application

A modern, full-stack food delivery application built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **Customer Features**
  - Browse restaurants and menu items
  - Guest checkout (no account required)
  - Advanced filters (cuisine, price, delivery time)
  - Promo codes and discounts
  - Live order tracking
  - Order history
  
- **Restaurant Dashboard**
  - Manage incoming orders
  - Update order status
  - Menu management (CRUD operations)
  - Sales analytics

- **Delivery Rider Dashboard**
  - View available orders
  - Accept/decline deliveries
  - Track active deliveries
  - Earnings overview

- **Admin Dashboard**
  - User management
  - Restaurant management
  - Order overview
  - System analytics

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Socket.IO Client

**Backend:**
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO
- Bcrypt

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Seed the database:
```bash
# Create admin user
node createAdmin.js

# Seed restaurants and food items
node seedData.js

# Seed restaurant owners and riders
node seedUsersAndRiders.js
```

Start the backend server:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Test Accounts

## 🔐 Test Accounts

Here are the credentials for testing different user roles:

### ⚡ Quick Logins

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Admin** | `admin@befoody.com` | `admin123` | Full system access |
| **Restaurant** | `maria@pizzaparadise.com` | `password123` | Owner of **Pizza Paradise** |
| **Restaurant** | `kenji@sushimaster.com` | `password123` | Owner of **Sushi Master** |
| **Restaurant** | `john@burgerhouse.com` | `password123` | Owner of **Burger House** |
| **Rider** | `alex.rider@befoody.com` | `password123` | Bike Rider |
| **Rider** | `sarah.rider@befoody.com` | `password123` | Scooter Rider |
| **Rider** | `mike.rider@befoody.com` | `password123` | Bicycle Rider |
| **Rider** | `emily.rider@befoody.com` | `password123` | Car Driver |

## 💳 Promo Codes

Test these promo codes at checkout:

- **FIRST50** - 50% off your order
- **SAVE20** - 20% off your order
- **FREEDEL** - Free delivery

## 🎯 Order Flow

1. **Customer** places order (guest or authenticated)
2. **Restaurant** receives notification → Confirms order
3. **Restaurant** prepares food → Marks as "Ready for Pickup"
4. **Rider** sees available order → Accepts delivery
5. **Rider** picks up and delivers → Marks as "Delivered"

## 📱 Application Routes

### Customer Routes
- `/` - Home page
- `/restaurants` - Browse all restaurants
- `/restaurants/:id` - Restaurant detail & menu
- `/cart` - Shopping cart
- `/checkout` - Checkout (guest or authenticated)
- `/orders` - Order history (authenticated only)
- `/profile` - User profile (authenticated only)

### Dashboard Routes
- `/admin` - Admin dashboard
- `/restaurant-dashboard` - Restaurant owner dashboard
- `/rider-dashboard` - Delivery rider dashboard

## 🎨 Design Features

- Modern gradient UI with custom color scheme
- Toast notifications for real-time feedback
- Skeleton loading states
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Live order tracking with visual timeline

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create restaurant (admin/restaurant)
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Food Items
- `GET /api/fooditems` - Get all food items
- `GET /api/fooditems/:id` - Get food item by ID
- `POST /api/fooditems` - Create food item
- `PUT /api/fooditems/:id` - Update food item
- `DELETE /api/fooditems/:id` - Delete food item

### Orders
- `POST /api/orders` - Create order (guest or authenticated)
- `GET /api/orders/my-orders` - Get user orders (authenticated)
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/admin/all` - Get all orders (admin)

### Riders
- `POST /api/riders/register` - Register as rider
- `GET /api/riders/available-orders` - Get available orders
- `POST /api/riders/accept-order` - Accept order
- `PUT /api/riders/complete-delivery/:orderId` - Complete delivery
- `GET /api/riders/my-deliveries` - Get rider's deliveries

## 🌟 Key Features Implemented

✅ Guest checkout  
✅ Real-time order updates (Socket.IO)  
✅ Advanced restaurant filters  
✅ Promo code system  
✅ Live order tracking  
✅ Multiple user roles (customer, restaurant, rider, admin)  
✅ Toast notifications  
✅ Responsive design  
✅ Order timeline visualization  

## 📝 License

MIT

## 👨‍💻 Developer

Built with ❤️ for Befoody
