import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
    user: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    dlNo?: string;
    gstinNo?: string;
    totalPurchases: number;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        address: { type: String },
        dlNo: { type: String },
        gstinNo: { type: String },
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

CustomerSchema.index({ user: 1, phone: 1 }, { unique: true });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
