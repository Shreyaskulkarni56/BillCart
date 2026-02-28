import axios from 'axios';
import { Product, Customer, Sale, BillItem } from '../data/dummyData';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const productApi = {
    getAll: async () => {
        const response = await api.get<Product[]>('/products');
        return response.data;
    },
    create: async (product: Omit<Product, 'id'>) => {
        const response = await api.post<Product>('/products', product);
        return response.data;
    },
    update: async (id: string, product: Partial<Product>) => {
        const response = await api.put<Product>(`/products/${id}`, product);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
    getLowStock: async () => {
        const response = await api.get<Product[]>('/products/low-stock');
        return response.data;
    },
};

export const customerApi = {
    getAll: async () => {
        const response = await api.get<Customer[]>('/customers');
        return response.data;
    },
    create: async (customer: Omit<Customer, 'id'>) => {
        const response = await api.post<Customer>('/customers', customer);
        return response.data;
    },
    update: async (id: string, customer: Partial<Customer>) => {
        const response = await api.put<Customer>(`/customers/${id}`, customer);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/customers/${id}`);
        return response.data;
    },
};

export const saleApi = {
    getAll: async () => {
        const response = await api.get<Sale[]>('/sales');
        return response.data;
    },
    create: async (saleData: {
        customerId: string;
        items: BillItem[];
        subtotal: number;
        tax: number;
        total: number;
    }) => {
        const response = await api.post<Sale>('/sales', saleData);
        return response.data;
    },
    getToday: async () => {
        const response = await api.get<Sale[]>('/sales/today');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<Sale>(`/sales/${id}`);
        return response.data;
    },
};

export default api;
