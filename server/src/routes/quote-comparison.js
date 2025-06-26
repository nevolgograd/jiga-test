const express = require("express");

const { aggregateQuotesData } = require("../repositories/quote.repository");

const router = express.Router();

router.get("/quote-comparison", async (req, res) => {
  const { quoteId } = req.query;

  try {
    const { quote, suppliers, ratings, items } = await aggregateQuotesData({
      quoteId,
    });

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const supplierMap = new Map(suppliers.map((s) => [s._id, s]));
    const ratingMap = new Map(ratings.map((r) => [r.supplierId, r.rating]));
    const itemMap = new Map(items.map((i) => [i._id, i.name]));

    const enrichedOffers = assignTopPick(
      quote.offers.map((offer) => ({
        ...offer,
        supplierName: supplierMap.get(offer.supplierId)?.name,
        supplierCountry: supplierMap.get(offer.supplierId)?.country,
        supplierRating: ratingMap.get(offer.supplierId),
        items: offer.items.map((item) => ({
          ...item,
          name: itemMap.get(item.itemId),
          totalPrice: item.quantity * item.unitPrice,
        })),
      })),
    );

    const notmalizedOffersData = normalizeOffersForTable(enrichedOffers);

    const { rows, suppliersMap } = notmalizedOffersData;

    res.json({
      _id: quote._id,
      rows: calculateUnitPriceStatus(rows),
      suppliers: calculateTotalPriceStatus(suppliersMap),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

function assignTopPick(offers) {
  const scoreMap = {}; // supplierId -> total score
  const MAX_SCORE = 5;
  const scoreStep = MAX_SCORE / Math.max(offers.length, 1);

  const score = (key, asc = true) => {
    offers
      .toSorted((a, b) => (asc ? a[key] - b[key] : b[key] - a[key]))
      .forEach(({ supplierId }, index) => {
        const score = MAX_SCORE - index * scoreStep;
        scoreMap[supplierId] =
          (scoreMap[supplierId] ?? 0) + Number(score.toFixed(1));
      });
  };

  score("totalPrice");
  score("leadTime");
  score("supplierRating", false);

  const topSupplierId = Object.entries(scoreMap).sort(
    ([, aScore], [, bScore]) => bScore - aScore,
  )[0][0];

  return offers.map((offer) => ({
    ...offer,
    isTopPick: offer.supplierId === topSupplierId,
  }));
}

function normalizeOffersForTable(offers) {
  const suppliersMap = {};
  const rowsMap = {};

  for (const offer of offers) {
    const {
      supplierId,
      supplierName,
      supplierCountry,
      supplierRating,
      leadTime,
      isTopPick,
      shippingPrice,
      totalPrice,
      items,
    } = offer;

    suppliersMap[supplierId] = {
      name: supplierName,
      country: supplierCountry,
      rating: supplierRating,
      leadTime,
      shippingPrice,
      totalPrice,
      isTopPick,
    };

    for (const item of items) {
      const { itemId, name, quantity, unitPrice } = item;

      if (!rowsMap[itemId]) {
        rowsMap[itemId] = {
          itemId,
          itemName: name,
          quantity,
          prices: {}, // supplierId -> price
        };
      }

      rowsMap[itemId].prices[supplierId] = {
        unitPrice,
        totalPrice: unitPrice * quantity,
      };
    }
  }

  return {
    suppliersMap,
    rows: Object.values(rowsMap),
  };
}

const getPriceStatus = ({ price, allPrices }) => {
  const STATUSES_COUNT = 5;
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const step = (max - min) / STATUSES_COUNT;

  const status = Math.floor((price - min) / step);
  return step === 0 ? 0 : Math.min(status, STATUSES_COUNT - 1);
};

function calculateUnitPriceStatus(rows) {
  return rows.map((row) => {
    const rowUnitPrices = [];

    for (const offer of Object.values(row.prices)) {
      rowUnitPrices.push(offer.unitPrice);
    }

    return {
      ...row,
      prices: Object.fromEntries(
        Object.entries(row.prices).map(([supplierId, prices]) => {
          return [
            supplierId,
            {
              ...prices,
              status: getPriceStatus({
                price: prices.unitPrice,
                allPrices: rowUnitPrices,
              }),
            },
          ];
        }),
      ),
    };
  });
}

function calculateTotalPriceStatus(suppliersMap) {
  const supplierTotalPrices = [];

  for (const supplier of Object.values(suppliersMap)) {
    supplierTotalPrices.push(supplier.totalPrice);
  }

  return Object.fromEntries(
    Object.entries(suppliersMap).map(([supplierId, supplier]) => {
      return [
        supplierId,
        {
          ...supplier,
          status: getPriceStatus({
            price: supplier.totalPrice,
            allPrices: supplierTotalPrices,
          }),
        },
      ];
    }),
  );
}

module.exports = router;
