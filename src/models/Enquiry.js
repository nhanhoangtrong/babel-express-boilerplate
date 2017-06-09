import mongoose, { Schema } from 'mongoose'

const enquirySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: String,
    content: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

enquirySchema.index({createdAt: -1})

export default mongoose.model('Enquiry', enquirySchema)
