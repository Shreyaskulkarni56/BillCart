import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Product,
  Customer,
  Sale,
  BillItem,
} from "../data/dummyData";
import { productApi, customerApi, saleApi } from "../services/api";
import { toast } from "@/hooks/use-toast";

interface AppContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  cart: BillItem[];
  selectedCustomer: Customer | null;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, "id">) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  setSelectedCustomer: (customer: Customer | null) => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  generateInvoice: (discount: number, gstRate: number) => Promise<Sale | null>;
  getTodaysSales: () => Sale[];
  getLowStockProducts: () => Product[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<BillItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Load initial data
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, customersData, salesData] = await Promise.all([
        productApi.getAll(),
        customerApi.getAll(),
        saleApi.getAll(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
      setSales(salesData);
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to fetch data from server.",
        variant: "destructive",
      });
    }
  };

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const newProduct = await productApi.create(product);
      setProducts([...products, newProduct]);
      toast({ title: "Product Added", description: `${product.name} has been added to inventory.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const updated = await productApi.update(product.id, product);
      setProducts(products.map((p) => (p.id === product.id ? updated : p)));
      toast({ title: "Product Updated", description: `${product.name} has been updated.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: "Product Deleted", description: "Product has been removed from inventory." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  const addCustomer = async (customer: Omit<Customer, "id">) => {
    try {
      const newCustomer = await customerApi.create(customer);
      setCustomers([...customers, newCustomer]);
      toast({ title: "Customer Added", description: `${customer.name} has been added.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add customer.", variant: "destructive" });
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      const updated = await customerApi.update(customer.id, customer);
      setCustomers(customers.map((c) => (c.id === customer.id ? updated : c)));
      toast({ title: "Customer Updated", description: `${customer.name} has been updated.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update customer.", variant: "destructive" });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerApi.delete(id);
      setCustomers(customers.filter((c) => c.id !== id));
      toast({ title: "Customer Deleted", description: "Customer has been removed." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete customer.", variant: "destructive" });
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    if (product.stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} ${product.unit}(s) available.`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock} ${product.unit}(s) available.`,
          variant: "destructive",
        });
        return;
      }
      updateCartItemQuantity(product.id, newQuantity);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          total: product.price * quantity,
          mrp: product.mrp,
          batchNo: product.batchNo,
          hsnCode: product.hsnCode,
          gstRate: product.gstRate,
        },
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && product.stock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} ${product.unit}(s) available.`,
        variant: "destructive",
      });
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity, total: item.price * quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const generateInvoice = async (discount: number, gstRate: number): Promise<Sale | null> => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to the cart before generating invoice.",
        variant: "destructive",
      });
      return null;
    }

    if (!selectedCustomer) {
      toast({
        title: "No Customer Selected",
        description: "Please select a customer before generating invoice.",
        variant: "destructive",
      });
      return null;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

    // Calculate tax per item to match InvoiceDialog logic
    // Formula: Sum of (Item Total * Item GST Rate)
    // Note: InvoiceDialog calculates tax on discounted taxable value.
    // So distinct tax = (ItemTotal * (1 - discount/100)) * (ItemGst/100)



    const totalTax = cart.reduce((sum, item) => {
      const itemGst = item.gstRate || 18; // Default to 18 if missing
      const discountedItemTotal = item.total * (1 - discount / 100);
      return sum + (discountedItemTotal * (itemGst / 100));
    }, 0);

    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const total = taxableAmount + totalTax;

    try {
      const newSale = await saleApi.create({
        customerId: selectedCustomer.id,
        items: cart,
        subtotal,
        tax: totalTax,
        total
      });

      // Refresh data to get updated stock
      await fetchData();

      clearCart();
      toast({
        title: "Invoice Generated",
        description: `Invoice ${newSale.invoiceNo || newSale.id} created successfully!`,
      });

      return newSale;
    } catch (error) {
      toast({
        title: "Error",
        description: (error as any).response?.data?.message || "Failed to generate invoice.",
        variant: "destructive",
      });
      return null;
    }
  };

  const getTodaysSales = () => {
    const today = new Date().toISOString().split("T")[0];
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date as any).toISOString().split("T")[0];
      return saleDate === today;
    });
  };

  const getLowStockProducts = () => {
    return products.filter((product) => product.stock <= product.minStock);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        sales,
        cart,
        selectedCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        setSelectedCustomer,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        generateInvoice,
        getTodaysSales,
        getLowStockProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
