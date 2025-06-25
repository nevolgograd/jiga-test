const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  _id: String,
  name: String,
});

const SupplierSchema = new mongoose.Schema({
  _id: String,
  name: String,
  country: String,
});

const QuoteItemSchema = new mongoose.Schema(
  {
    itemId: String,
    unitPrice: Number,
    quantity: Number,
  },
  { _id: false },
);

const OfferSchema = new mongoose.Schema(
  {
    supplierId: String,
    items: [QuoteItemSchema],
    shippingPrice: Number,
    totalPrice: Number,
    leadTime: Number,
  },
  { _id: false },
);

const QuoteSchema = new mongoose.Schema({
  _id: String,
  customerName: String,
  offers: [OfferSchema],
});

const RatingSchema = new mongoose.Schema({
  supplierId: String,
  rating: Number,
});

const Item = mongoose.models?.Item || mongoose.model("Item", ItemSchema);
const Supplier =
  mongoose.models?.Supplier || mongoose.model("Supplier", SupplierSchema);
const Quote = mongoose.models?.Quote || mongoose.model("Quote", QuoteSchema);
const Rating =
  mongoose.models?.Rating || mongoose.model("Rating", RatingSchema);

module.exports = { Item, Supplier, Quote, Rating };
