import { useEffect, useState } from "react";

import { quotesHttpService } from "./services/quotes";
import { QuoteComparisonTable } from "./features/QuoteComparison/QuoteComparisonTable";

function App() {
  const [quotes, setQuotes] = useState({ rows: [], suppliers: {} });

  useEffect(() => {
    const getQuotes = async () => {
      const res = await quotesHttpService.getRows({ quoteId: "q1" });
      setQuotes(res);
    };

    getQuotes();
  }, []);

  return (
    <QuoteComparisonTable rows={quotes.rows} suppliers={quotes.suppliers} />
  );
}

export default App;
