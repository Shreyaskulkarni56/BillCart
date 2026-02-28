import mongoose, { Document, Schema } from 'mongoose';

interface ISaleItem {
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface ISale extends Document {
    invoiceNo: string;
    date: Date;
    customerId: mongoose.Types.ObjectId;
    customerName: string;
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
    price: { type: Number, required: true },
    total: { type: Number, required: true },
});

const SaleSchema = new Schema<ISale>(
    {
        invoiceNo: { type: String, required: true, unique: true },
        date: { type: Date, default: Date.now },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        customerName: { type: String, required: true },
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

export default mongoose.model<ISale>('Sale', SaleSchema);
