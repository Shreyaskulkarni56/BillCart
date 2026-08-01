import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
    shopName: string;
    address: string;
    gstin: string;
    phone: string;
    email: string;
    state: string;
    stateCode: string;
    invoicePrefix: string;
}

const SettingsSchema = new Schema<ISettings>({
    shopName: { type: String, required: true },
    address: { type: String },
    gstin: { type: String },
    phone: { type: String },
    email: { type: String },
    state: { type: String },
    stateCode: { type: String },
    invoicePrefix: { type: String, default: 'SLN' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
