import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    totalPurchases: number;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        email: { type: String },
        address: { type: String },
        totalPurchases: { type: Number, default: 0 },
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

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
