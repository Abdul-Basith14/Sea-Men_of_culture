# Business Profit Tracker - Backend

Backend API for the Business Profit Tracking System built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT Authentication with first-login password change
- ✅ 4-member profit tracking system
- ✅ Automatic 25% profit distribution
- ✅ Two-step payment approval system
- ✅ Project and product management with auto-generated codes
- ✅ Cloudinary image upload integration
- ✅ Transaction tracking

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with the following:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/profit-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Setup MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
# Start MongoDB
mongod
```

### 4. Seed Initial Users
Run the seed script to create 4 initial members:

```bash
npm run seed
```

This will create 4 members:
- rahul@business.com - Password: temp123
- priya@business.com - Password: temp123
- amit@business.com - Password: temp123
- sneha@business.com - Password: temp123

Users will be prompted to change their password on first login.

### 5. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password (first login)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all members
- `GET /api/users/:id` - Get single member
- `PUT /api/users/:id` - Update member profile
- `GET /api/users/:id/financials` - Get financial summary

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get all projects (with filters)
- `GET /api/projects/:id` - Get single project with products
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `PATCH /api/projects/:id/complete` - Mark project as completed

### Products
- `POST /api/products` - Add product to project
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/sell` - Mark product as sold

### Payments
- `POST /api/payments/request-approval` - Request payment approval
- `POST /api/payments/approve` - Approve payment
- `POST /api/payments/reject` - Reject payment
- `GET /api/payments/pending-approvals` - Get pending approvals

## Payment Flow

1. **Product Sold**: When a product is marked as sold:
   - Seller's total profit increases by their 25% share only (not full profit)
   - Seller owes 25% to each of the other 3 members
   - Other members have receivables from the seller (25% each)
   - Revenue is distributed equally: each of the 4 members gets 25% of selling price

2. **Payment Request**: Payer (seller) requests payment approval:
   - Creates pending approval for receiver
   - Transaction status changes to 'approval_requested'

3. **Payment Approval**: Receiver approves the payment:
   - Amount removed from payer's dues
   - Amount removed from receiver's receivables
   - Amount added to receiver's total profit
   - Transaction status changes to 'paid'

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── productController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Product.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── productRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/
│   │   ├── codeGenerator.js
│   │   ├── imageUpload.js
│   │   └── seedUsers.js
│   └── server.js
├── .env
├── .gitignore
└── package.json
```

## Testing

Test the API using tools like Postman or Thunder Client.

### Example: Login Request
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "rahul@business.com",
  "password": "temp123"
}
```

### Example: Mark Product as Sold
```bash
PATCH http://localhost:5000/api/products/:productId/sell
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "sellingPrice": 1200,
  "soldBy": "USER_ID"
}
```

## Notes

- All routes except `/api/auth/register` and `/api/auth/login` require JWT authentication
- Images are uploaded to Cloudinary with automatic optimization
- Project and product codes are auto-generated as unique 5-character alphanumeric strings
- The system requires exactly 4 members for profit calculations to work correctly
