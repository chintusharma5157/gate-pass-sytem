const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    visitorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Visitor', 
        required: true 
    },
    hostId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    purpose: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    qrCodeData: { type: String }, 
    entryTime: { type: Date }, 
    exitTime: { type: Date },  
    validTill: { type: Date }  // Pass kab tak valid hai
}, { timestamps: true });

module.exports = mongoose.model('Visit', visitSchema);
