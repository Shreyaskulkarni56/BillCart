import mongoose, { Document, Schema } from 'mongoose';

interface ISaleItem {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    freeQty?: number;
    price: number;
    mrp?: number;
    batchNo?: string;
    hsnCode?: string;
    gstRate?: number;
    total: number;
}

export interface ISale extends Document {
    user: mongoose.Types.ObjectId;
    invoiceNo: string;
    date: Date;
    customerId: mongoose.Types.ObjectId;
    customerName: string;
    customerDlNo?: string;
    customerGstinNo?: string;
    subtotal: number;
    tax: number;
    total: number;
    items: ISaleItem[];
    createdAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    freeQty: { type: Number, default: 0 },
    price: { type: Number, required: true },
    mrp: { type: Number },
    batchNo: { type: String },
    hsnCode: { type: String },
    gstRate: { type: Number },
    total: { type: Number, required: true },
});

const SaleSchema = new Schema<ISale>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        invoiceNo: { type: String, required: true },
        date: { type: Date, default: Date.now },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        customerName: { type: String, required: true },
        customerDlNo: { type: String },
        customerGstinNo: { type: String },
        subtotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        total: { type: Number, required: true },
        items: [SaleItemSchema],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret: any) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

SaleSchema.index({ user: 1, invoiceNo: 1 }, { unique: true });

export default mongoose.model<ISale>('Sale', SaleSchema);
