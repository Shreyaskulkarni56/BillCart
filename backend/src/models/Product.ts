import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
    user: mongoose.Types.ObjectId;
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
    gstRate?: number;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        mrp: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        minStock: { type: Number, default: 0 },
        unit: { type: String, required: true },
        sku: { type: String, required: true },
        batchNo: { type: String },
        hsnCode: { type: String },
        gstRate: { type: Number },
        expiryDate: { type: Date },
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

ProductSchema.index({ user: 1, sku: 1 }, { unique: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
