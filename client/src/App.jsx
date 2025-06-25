import { useEffect, useState } from "react";

import { quotesHttpService } from "./services/quotes";
import { QuoteComparisonTable } from "./features/QuoteComparison/QuoteComparisonTable";

const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const quoteId = params.get("quoteId") ?? "q1";

function App() {
  const [quotes, setQuotes] = useState({ rows: [], suppliers: {} });

  useEffect(() => {
    const getQuotes = async () => {
      const res = await quotesHttpService.getRows({ quoteId });
      setQuotes(res);
    };

    getQuotes();
  }, []);

  return (
    <QuoteComparisonTable rows={quotes.rows} suppliers={quotes.suppliers} />
  );
}

export default App;
