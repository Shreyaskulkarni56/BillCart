# ShopEase Backend

Node.js + Express + MongoDB + TypeScript backend for ShopEase.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (or use the provided one) with:
    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/shopease
    NODE_ENV=development
    ```

3.  **Seed Database (Optional)**:
    Populate the database with initial dummy data:
    ```bash
    npm run seed
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Get low stock products

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Sales
- `GET /api/sales` - List sales
- `GET /api/sales/:id` - Get sale details
- `POST /api/sales` - Create sale (Generate Invoice)
- `GET /api/sales/today` - Get today's sales
