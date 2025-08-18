import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1,
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  staffName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
