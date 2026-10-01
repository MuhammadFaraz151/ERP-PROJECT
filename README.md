# ERP Billing System

A comprehensive billing and inventory management system built with React, Node.js, and MongoDB. This application provides complete control over inventory, invoicing, supplier management, and business settings with a modern, responsive interface featuring day/night mode support.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview of sales, profit, revenue, and invoice statistics with PDF export capability
- **Inventory Management**: Complete product catalog with stock tracking, expiry monitoring, and unit-based measurements
- **Invoice Generation**: Create professional invoices with customer management, payment tracking, and GST calculations
- **Sales & Reports**: View all invoices, track payments, manage remaining balances, and generate reports
- **Customer Management**: Add, edit, and manage customer profiles with business tracking
- **Supplier Management**: Manage suppliers, track purchases, and handle partial payments
- **Category Management**: Organize products into custom categories
- **Refund System**: Process refunds for invoices with detailed tracking
- **Settings**: Configure app name, username, store name, and logo

### Advanced Features
- **Day/Night Mode**: Toggle between light and dark themes with persistent preference
- **PDF Export**: Generate professional PDF reports for daily, weekly, and monthly sales data
- **Stock Management**: Track inventory with low stock alerts and expiry warnings
- **Unit Selection**: Support for multiple units (pieces, kg, gram, liter, ml)
- **Payment Tracking**: Track paid amounts, remaining balances, and payment history
- **GST Calculations**: Automatic GST calculation with profit display
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## 🛠 Tech Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Redux Toolkit**: State management for global app state
- **React Redux**: React bindings for Redux
- **Vite**: Fast build tool and development server
- **Tailwind CSS v4**: Utility-first CSS framework for styling
- **Axios**: HTTP client for API requests
- **Lucide React**: Beautiful icon library
- **jsPDF**: PDF generation library
- **jspdf-autotable**: PDF table generation

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **CORS**: Cross-origin resource sharing
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Authentication tokens

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (installed and running)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/MuhammadFaraz151/ERP-PROJECT.git
cd ERP-PROJECT
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5555
MONGODB_URI=mongodb://localhost:27017/billing-system
JWT_SECRET=your-secret-key
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5555`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is occupied)

## 🏗 Project Structure

```
billing-system/
├── backend/
│   ├── Src/
│   │   ├── Auth/              # Authentication logic
│   │   │   ├── auth.js
│   │   │   └── userSchema.js
│   │   ├── Category/          # Category management
│   │   │   ├── categoryRoutes.js
│   │   │   └── categorySchema.js
│   │   ├── Customer/          # Customer management
│   │   │   ├── addCustomer.js
│   │   │   ├── allCustomers.js
│   │   │   ├── customerSchema.js
│   │   │   ├── deleteCustomer.js
│   │   │   └── updateCustomer.js
│   │   ├── Inventory/         # Product inventory
│   │   │   ├── Inventory.js
│   │   │   ├── InventorySchema.js
│   │   │   ├── delInventoryItem.js
│   │   │   ├── fullinventory.js
│   │   │   ├── updateItem.js
│   │   │   └── updateStock.js
│   │   ├── Invoice/           # Invoice management
│   │   │   ├── Invoice.js
│   │   │   ├── getInvoices.js
│   │   │   ├── invoiceSchema.js
│   │   │   └── payRemaining.js
│   │   ├── Refund/            # Refund processing
│   │   │   ├── refund.js
│   │   │   └── refundSchema.js
│   │   └── Seller/            # Supplier management
│   │       ├── purchaseRoutes.js
│   │       ├── purchaseSchema.js
│   │       ├── sellerRoutes.js
│   │       └── sellerSchema.js
│   ├── node_modules/
│   ├── server.js              # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── assets/            # Static assets (logo, stamps)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/          # Login component
│   │   │   ├── Dashboard.jsx  # Main dashboard
│   │   │   ├── Home.jsx       # Main layout wrapper
│   │   │   ├── Inventory.jsx  # Inventory management
│   │   │   ├── InventoryCard.jsx
│   │   │   ├── Navbar.jsx     # Top navigation
│   │   │   ├── Sidebar.jsx    # Side navigation
│   │   │   ├── Settings.jsx   # App settings
│   │   │   ├── Categories.jsx # Category management
│   │   │   ├── Customer.jsx   # Customer management
│   │   │   ├── Seller.jsx     # Supplier management
│   │   │   ├── Refund.jsx     # Refund processing
│   │   │   ├── Products/
│   │   │   │   ├── Addproducts.jsx
│   │   │   │   ├── ProductFormModal.jsx
│   │   │   │   └── Productapi.jsx
│   │   │   ├── Invoice/
│   │   │   │   ├── Invoice.jsx
│   │   │   │   ├── InvoiceCard.jsx
│   │   │   │   ├── InvoiceDetail.jsx
│   │   │   │   ├── InvoicePreview.css
│   │   │   │   ├── InvoicePreview.jsx
│   │   │   │   ├── Customerslist.jsx
│   │   │   │   ├── Paymentsummary.jsx
│   │   │   │   └── Productslist.jsx
│   │   │   └── Invoices and sales/
│   │   │       └── Invoices.jsx
│   │   ├── store and slices/
│   │   │   ├── Store.jsx      # Redux store configuration
│   │   │   ├── authSlice.js   # Authentication state
│   │   │   ├── infoSlice.jsx  # App info state
│   │   │   ├── tabSlice.js    # Tab navigation state
│   │   │   └── themeSlice.jsx # Theme state
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── node_modules/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📖 Usage

### Getting Started

1. **Login**: Access the application using your credentials
2. **Dashboard**: View sales, profit, and revenue statistics
3. **Add Products**: Navigate to Products tab to add inventory items
4. **Manage Categories**: Create product categories for better organization
5. **Add Customers**: Add customer profiles for invoicing
6. **Add Suppliers**: Add supplier information for purchase tracking
7. **Generate Invoices**: Create invoices by selecting customer and adding products
8. **Track Payments**: Monitor paid and remaining amounts for invoices
9. **Process Refunds**: Handle refunds from the Refund tab
10. **Settings**: Customize app name, username, and store logo

### Key Workflows

#### Adding a Product
1. Go to the "Products" tab
2. Click "Add Product"
3. Fill in product details:
   - Product Name
   - Category (with autocomplete suggestions)
   - Selling Price
   - Unit Cost
   - Stock Quantity
   - Unit (pcs, kg, gram, liter, ml)
   - GST Percentage
   - Expiry Date
4. Click "Save Product"

#### Creating an Invoice
1. Go to "Invoice Generator" tab
2. Select a customer from the dropdown
3. Add products by searching and selecting from inventory
4. Specify quantities for each product
5. Apply discount if needed
6. Select payment method
7. Enter paid amount
8. Click "Generate Invoice"
9. Print or save the invoice as PDF

#### Managing Purchases
1. Go to "Supplier" tab
2. Switch to "Purchases" sub-tab
3. Click "New Purchase"
4. Select supplier
5. Add items with:
   - Product name and category
   - Purchase quantity
   - Stock to add (can differ from purchase quantity)
   - Unit cost
6. Enter total amount and paid amount
7. Select payment method
8. Submit the purchase

#### Using Day/Night Mode
- Click the theme toggle icon in the navbar
- Theme preference is saved automatically
- Applies to all pages and components

#### Exporting PDF Reports
1. Go to Dashboard
2. On profit cards (Daily, Weekly, Monthly), click the download icon
3. PDF will be generated with:
   - Report title and date
   - Revenue summary
   - Profit summary
   - Invoice count
   - Detailed invoice table

## 🔧 Configuration

### Environment Variables (Backend)
- `PORT`: Server port (default: 5555)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

### App Settings (Frontend)
Accessed via Settings tab:
- **App Name**: Display name of the application
- **Store Name**: Business/store name for invoices
- **Username**: Current user's display name
- **Logo**: Upload custom store logo

## 🎨 Theme Support

The application supports two themes:
- **Dark Mode**: Dark backgrounds with light text (default)
- **Light Mode**: Light backgrounds with dark text

Theme is applied consistently across:
- Navigation (Navbar & Sidebar)
- Dashboard cards and charts
- All tables and data displays
- Forms and input fields
- Modals and dialogs
- Settings page

## 📊 Database Schema

### Inventory
- name: String
- category: String
- unitCost: Number
- sellingPrice: Number
- stock: Number
- unit: String (enum: pcs, kg, gram, liter, ml)
- GST: Number
- expiryDate: Date

### Customer
- name: String
- phone: String
- email: String
- address: String
- business: Number (total business amount)

### Seller (Supplier)
- name: String
- phone: String
- email: String
- address: String
- company: String
- totalPurchases: Number
- remainingAmount: Number

### Purchase
- seller: ObjectId (ref: Seller)
- sellerName: String
- items: Array (name, category, quantity, stock, unitCost, totalCost)
- totalAmount: Number
- paidAmount: Number
- remainingAmount: Number
- paymentMethod: String
- status: String (Pending/Paid)

### Invoice
- customer: ObjectId (ref: Customer)
- customerName: String
- items: Array (product details with GST)
- subtotal: Number
- totalGST: Number
- discount: Number
- grandTotal: Number
- paymentMethod: String
- paidAmount: Number
- remainingAmount: Number
- status: String (Pending/Paid)

### Refund
- invoice: ObjectId (ref: Invoice)
- items: Array (refunded items)
- totalRefunded: Number
- refundDate: Date

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Muhammad Faraz** - Initial work

## 🙏 Acknowledgments

- Built with React, Node.js, and MongoDB
- UI components styled with Tailwind CSS
- Icons from Lucide React
- PDF generation using jsPDF

## 📞 Support

For support, email faraz@example.com or open an issue in the GitHub repository.

---

**Note**: This is a comprehensive billing system designed for small to medium businesses. Always backup your data regularly and ensure proper security measures are in place for production use.
#   E R P - P R O J E C T  
 #   E R P - P R O J E C T  
 