const { Quote, Supplier, Rating, Item } = require("../models");

async function aggregateQuotesData(params) {
  try {
    const quote = await Quote.findOne({ _id: params.quoteId }).lean();

    if (!quote?.offers?.length) {
      return res.status(404).json({ error: "Quote or offers not found" });
    }

    const supplierIds = [
      ...new Set(quote.offers.map(({ supplierId }) => supplierId)),
    ];

    const itemIds = [
      ...new Set(
        quote.offers.flatMap(({ items }) =>
          (items ?? []).map(({ itemId }) => itemId),
        ),
      ),
    ];

    const [suppliers, ratings, items] = await Promise.all([
      Supplier.find({ _id: { $in: supplierIds } }).lean(),
      Rating.find({ supplierId: { $in: supplierIds } }).lean(),
      Item.find({ _id: { $in: itemIds } }).lean(),
    ]);

    return {
      quote,
      suppliers,
      ratings,
      items,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  aggregateQuotesData,
};
