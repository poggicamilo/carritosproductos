const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: { type: String, unique: true },
  price: Number,
  status: { type: Boolean, default: true },
  stock: Number,
  category: String,
  thumbnails: [String]
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
