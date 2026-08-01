import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Product,
  Customer,
  Sale,
  BillItem,
} from "../types";
import { productApi, customerApi, saleApi, settingsApi } from "../services/api";
import { toast } from "@/hooks/use-toast";

// ... existing code ... (ignoring this replace because I can just do it line by line)

interface AppContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  cart: BillItem[];
  selectedCustomer: Customer | null;
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
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
  generateInvoice: (discount: number) => Promise<Sale | null>;
  updateSaleDate: (id: string, date: string) => Promise<void>;
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
  const [settings, setSettingsState] = useState<any>(null);

  // Load initial data
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, customersData, salesData, settingsData] = await Promise.all([
        productApi.getAll(),
        customerApi.getAll(),
        saleApi.getAll(),
        settingsApi.get(),
      ]);
      setProducts(productsData);
      setCustomers(customersData);
      setSales(salesData);
      setSettingsState(settingsData);
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to fetch data from server.",
        variant: "destructive",
      });
    }
  };

  const updateSettings = async (settingsData: any) => {
    try {
      const updated = await settingsApi.update(settingsData);
      setSettingsState(updated);
      toast({ title: "Settings Updated", description: "Your settings have been saved successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
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
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to add customer.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      const updated = await customerApi.update(customer.id, customer);
      setCustomers(customers.map((c) => (c.id === customer.id ? updated : c)));
      toast({ title: "Customer Updated", description: `${customer.name} has been updated.` });
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update customer.";
      toast({ title: "Error", description: msg, variant: "destructive" });
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

  const generateInvoice = async (discount: number): Promise<Sale | null> => {
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

    const totalTax = cart.reduce((sum, item) => {
      const itemGst = item.gstRate || 5; 
      const discountedItemTotal = item.total * (1 - discount / 100);
      return sum + Math.round((discountedItemTotal * (itemGst / 100)) * 100) / 100;
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

  const updateSaleDate = async (id: string, date: string) => {
    try {
      const updatedSale = await saleApi.update(id, { date });
      setSales(sales.map((s) => (s.id === id ? updatedSale : s)));
      toast({ title: "Sale Updated", description: "The transaction date has been updated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update transaction date.", variant: "destructive" });
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
        settings,
        updateSettings,
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
        updateSaleDate,
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
