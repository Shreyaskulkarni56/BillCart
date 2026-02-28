# ShopEase

ShopEase is a full-stack application for managing shop operations, built with modern web technologies.

## Technology Stack

### Frontend
- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB
- **Language**: TypeScript

---

## Setup & Installation

### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `backend` directory with the following content:
    ```env
    PORT=5000
    MONGO_URI
    NODE_ENV=development
    ```

4.  **Seed Database (Optional)**:
    Populate the database with initial dummy data:
    ```bash
    npm run seed
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The backend server will likely start on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The frontend application will start (usually on `http://localhost:8080` or similar, check the console output).

---

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
