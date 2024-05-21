import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    }
});

const contactModel = mongoose.model('Contact_model', contactSchema);

export default contactModel;