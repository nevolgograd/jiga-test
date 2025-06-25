import React, { useMemo } from "react";
import "./QuoteComparisonTable.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("us", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDays = (days) => {
  return new Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "day",
    unitDisplay: "long",
  }).format(days);
};

export function QuoteComparisonTable({ suppliers, rows }) {
  const suppliersEntries = useMemo(
    () => Object.entries(suppliers),
    [suppliers],
  );

  return (
    <div className="quote-table-wrapper">
      <h1>
        Detailed quotes comparison{" "}
        <span>({suppliersEntries.length} suppliers)</span>
      </h1>

      <table className="quote-table">
        <thead>
          <tr>
            <th rowSpan="2">Part Name</th>
            <th rowSpan="2">Qty</th>
            {suppliersEntries.map(([id, s]) => (
              <th key={id} className="supplier-header" colSpan="2">
                <div className="supplier-header-wrapper">
                  <span className="name">{s.name}</span>
                  <span className="country">{s.country}</span>
                  <span className="rating">⭐ {s.rating}</span>
                </div>
                {s.isTopPick && <span className="top-pick">Top Pick</span>}
              </th>
            ))}
          </tr>

          <tr>
            {suppliersEntries.map(([id]) => (
              <React.Fragment key={id}>
                <th>Unit Price</th>
                <th>Total Price</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((item) => (
            <tr key={item.itemId}>
              <td>{item.itemName}</td>
              <td>{item.quantity}</td>
              {suppliersEntries.map(([id]) => {
                const offer = item.prices[id];
                return offer ? (
                  <React.Fragment key={id}>
                    <td data-status={offer.status}>
                      {formatPrice(offer.unitPrice)}
                    </td>
                    <td data-status={offer.status}>
                      {formatPrice(offer.totalPrice)}
                    </td>
                  </React.Fragment>
                ) : (
                  <React.Fragment key={id}>
                    <td colSpan="2"></td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}

          <tr>
            <td>Shipping Fee</td>
            <td />
            {suppliersEntries.map(([id, s]) => (
              <React.Fragment key={id}>
                <td />
                <td>{formatPrice(s.shippingPrice)}</td>
              </React.Fragment>
            ))}
          </tr>

          <tr>
            <td>Lead Time</td>
            <td />
            {suppliersEntries.map(([id, s]) => (
              <React.Fragment key={id}>
                <td />
                <td>{formatDays(s.leadTime)}</td>
              </React.Fragment>
            ))}
          </tr>

          <tr>
            <th>Total Price</th>
            <td />
            {suppliersEntries.map(([id, s]) => (
              <React.Fragment key={id}>
                <td />
                <td data-status={s.status}>{formatPrice(s.totalPrice)}</td>
              </React.Fragment>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
