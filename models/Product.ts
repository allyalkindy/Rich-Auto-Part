import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
