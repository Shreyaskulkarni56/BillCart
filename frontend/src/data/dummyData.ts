export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  stock: number;
  minStock: number;
  unit: string;
  sku: string;
  batchNo?: string;
  hsnCode?: string;
  gstRate?: number; // GST rate in percentage (e.g., 12 for 12%)
  expiryDate?: string; // ISO date string
}

// Helper to check expiry status
export const getExpiryStatus = (expiryDate?: string): 'expired' | 'expiring-soon' | 'valid' | 'unknown' => {
  if (!expiryDate) return 'unknown';
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 90) return 'expiring-soon'; // Within 3 months
  return 'valid';
};

export const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  totalPurchases: number;
}

export interface BillItem {
  productId: string;
  productName: string;
  quantity: number;
  freeQty?: number;
  price: number;
  mrp?: number;
  batchNo?: string;
  total: number;
  hsnCode?: string;
  gstRate?: number;
}

export interface Sale {
  id: string;
  invoiceNo?: string;
  date: string;
  customerId: string;
  customerName: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export const initialProducts: Product[] = [
  { id: "P001", name: "Paracetamol 500mg", category: "Medicine", price: 25, mrp: 30, stock: 150, minStock: 50, unit: "Strip", sku: "MED001", batchNo: "B240115", hsnCode: "3004", gstRate: 12, expiryDate: "2025-06-15" },
  { id: "P002", name: "Cough Syrup 100ml", category: "Medicine", price: 85, mrp: 95, stock: 45, minStock: 30, unit: "Bottle", sku: "MED002", batchNo: "B240116", hsnCode: "3004", gstRate: 12, expiryDate: "2025-03-20" },
  { id: "P003", name: "Bandage Roll", category: "First Aid", price: 35, mrp: 40, stock: 8, minStock: 20, unit: "Piece", sku: "FA001", batchNo: "B240110", hsnCode: "3005", gstRate: 12, expiryDate: "2027-12-31" },
  { id: "P004", name: "Antiseptic Cream", category: "First Aid", price: 65, mrp: 75, stock: 62, minStock: 25, unit: "Tube", sku: "FA002", batchNo: "B240112", hsnCode: "3004", gstRate: 12, expiryDate: "2025-02-10" },
  { id: "P005", name: "Digital Thermometer", category: "Equipment", price: 250, mrp: 299, stock: 12, minStock: 10, unit: "Piece", sku: "EQ001", batchNo: "B240101", hsnCode: "9025", gstRate: 18 },
  { id: "P006", name: "Blood Pressure Monitor", category: "Equipment", price: 1850, mrp: 2100, stock: 5, minStock: 5, unit: "Piece", sku: "EQ002", batchNo: "B240102", hsnCode: "9018", gstRate: 12 },
  { id: "P007", name: "Vitamin C Tablets", category: "Supplements", price: 120, mrp: 150, stock: 0, minStock: 40, unit: "Bottle", sku: "SUP001", batchNo: "B240108", hsnCode: "2106", gstRate: 18, expiryDate: "2025-01-05" },
  { id: "P008", name: "Calcium + D3", category: "Supplements", price: 180, mrp: 210, stock: 35, minStock: 30, unit: "Bottle", sku: "SUP002", batchNo: "B240109", hsnCode: "2106", gstRate: 18, expiryDate: "2026-08-15" },
  { id: "P009", name: "Face Mask N95", category: "Protection", price: 45, mrp: 50, stock: 200, minStock: 100, unit: "Piece", sku: "PR001", batchNo: "B240105", hsnCode: "6307", gstRate: 5, expiryDate: "2027-01-01" },
  { id: "P010", name: "Hand Sanitizer 500ml", category: "Hygiene", price: 95, mrp: 110, stock: 18, minStock: 25, unit: "Bottle", sku: "HY001", batchNo: "B240106", hsnCode: "3808", gstRate: 18, expiryDate: "2025-04-30" },
  { id: "P011", name: "Cotton Rolls", category: "First Aid", price: 55, mrp: 65, stock: 75, minStock: 30, unit: "Pack", sku: "FA003", batchNo: "B240107", hsnCode: "5601", gstRate: 5 },
  { id: "P012", name: "Glucometer Strips", category: "Equipment", price: 450, mrp: 500, stock: 22, minStock: 15, unit: "Box", sku: "EQ003", batchNo: "B240103", hsnCode: "9027", gstRate: 12, expiryDate: "2025-09-30" },
];

export const initialCustomers: Customer[] = [
  { id: "C001", name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@email.com", address: "123 Main Street, Delhi", balance: 0, totalPurchases: 15600 },
  { id: "C002", name: "Priya Sharma", phone: "9876543211", email: "priya@email.com", address: "456 Park Road, Mumbai", balance: 500, totalPurchases: 8900 },
  { id: "C003", name: "Amit Patel", phone: "9876543212", email: "amit@email.com", address: "789 Lake View, Ahmedabad", balance: 0, totalPurchases: 22400 },
  { id: "C004", name: "Sunita Devi", phone: "9876543213", email: "sunita@email.com", address: "321 Garden Lane, Pune", balance: 1200, totalPurchases: 5600 },
  { id: "C005", name: "Walk-in Customer", phone: "-", email: "-", address: "-", balance: 0, totalPurchases: 0 },
];

export const initialSales: Sale[] = [
  {
    id: "INV001",
    date: "2024-01-15",
    customerId: "C001",
    customerName: "Rajesh Kumar",
    items: [
      { productId: "P001", productName: "Paracetamol 500mg", quantity: 5, price: 25, total: 125 },
      { productId: "P003", productName: "Bandage Roll", quantity: 2, price: 35, total: 70 },
    ],
    subtotal: 195,
    tax: 35.1,
    total: 230.1,
  },
  {
    id: "INV002",
    date: "2024-01-15",
    customerId: "C002",
    customerName: "Priya Sharma",
    items: [
      { productId: "P002", productName: "Cough Syrup 100ml", quantity: 1, price: 85, total: 85 },
    ],
    subtotal: 85,
    tax: 15.3,
    total: 100.3,
  },
  {
    id: "INV003",
    date: "2024-01-14",
    customerId: "C003",
    customerName: "Amit Patel",
    items: [
      { productId: "P005", productName: "Digital Thermometer", quantity: 1, price: 250, total: 250 },
      { productId: "P009", productName: "Face Mask N95", quantity: 10, price: 45, total: 450 },
    ],
    subtotal: 700,
    tax: 126,
    total: 826,
  },
];

export const categories = ["Medicine", "First Aid", "Equipment", "Supplements", "Protection", "Hygiene"];
