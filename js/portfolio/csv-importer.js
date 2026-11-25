/**
 * PORTFOLIO CRASH THEATRE — SECURE CSV IMPORTER
 * Delimiter auto-detection, formula injection sanitization, column mapping, validation, duplicate detection.
 */

export class CSVImporter {
  /**
   * Sanitize string against formula/CSV injection
   */
  static sanitizeCell(val) {
    if (typeof val !== 'string') return val;
    let clean = val.trim();
    // Strip leading formula execution characters: =, +, -, @, \t, \r
    if (/^[=+\-@\t\r]/.test(clean)) {
      clean = clean.replace(/^[=+\-@\t\r]+/, '');
    }
    // Prevent XSS
    return clean.replace(/[<>]/g, '');
  }

  /**
   * Auto-detect CSV delimiter (comma, semicolon, tab)
   */
  static detectDelimiter(sampleText) {
    const lines = sampleText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return ',';
    const firstLine = lines[0];

    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;

    if (semiCount > commaCount && semiCount > tabCount) return ';';
    if (tabCount > commaCount && tabCount > semiCount) return '\t';
    return ',';
  }

  /**
   * Parse CSV lines respecting quotes
   */
  static parseCSV(text) {
    const delimiter = this.detectDelimiter(text);
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV file must contain a header row and at least one data row.');
    }

    const rows = [];
    for (const line of lines) {
      const row = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          row.push(this.sanitizeCell(current));
          current = '';
        } else {
          current += char;
        }
      }
      row.push(this.sanitizeCell(current));
      rows.push(row);
    }

    const headers = rows[0].map(h => h.trim());
    const dataRows = rows.slice(1);

    return { headers, dataRows };
  }

  /**
   * Guess column mappings based on common header names
   */
  static guessColumnMapping(headers) {
    const mapping = {
      symbol: -1,
      name: -1,
      assetClass: -1,
      sector: -1,
      quantity: -1,
      buyPrice: -1,
      currentPrice: -1,
      beta: -1,
      volatility: -1,
      liquidity: -1,
    };

    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    headers.forEach((h, idx) => {
      const norm = normalize(h);
      if (['symbol', 'ticker', 'code', 'asset'].includes(norm)) mapping.symbol = idx;
      else if (['name', 'assetname', 'description', 'company'].includes(norm)) mapping.name = idx;
      else if (['assetclass', 'class', 'type', 'category'].includes(norm)) mapping.assetClass = idx;
      else if (['sector', 'industry'].includes(norm)) mapping.sector = idx;
      else if (['quantity', 'qty', 'shares', 'units', 'amount'].includes(norm)) mapping.quantity = idx;
      else if (['buyprice', 'avgprice', 'costbasis', 'purchaseprice', 'cost'].includes(norm)) mapping.buyPrice = idx;
      else if (['currentprice', 'price', 'marketprice', 'lastprice', 'value'].includes(norm)) mapping.currentPrice = idx;
      else if (['beta'].includes(norm)) mapping.beta = idx;
      else if (['volatility', 'vol', 'stddev'].includes(norm)) mapping.volatility = idx;
      else if (['liquidity', 'liq'].includes(norm)) mapping.liquidity = idx;
    });

    return mapping;
  }

  /**
   * Validate and transform raw rows using selected mapping
   */
  static processImportRows(dataRows, mapping) {
    const validated = [];
    const errors = [];
    const seenSymbols = new Set();

    dataRows.forEach((row, index) => {
      const rowNum = index + 2; // +1 for 0-index, +1 for header
      const symbol = (mapping.symbol !== -1 && row[mapping.symbol]) ? row[mapping.symbol].toUpperCase().trim() : '';
      const name = (mapping.name !== -1 && row[mapping.name]) ? row[mapping.name].trim() : symbol;
      const assetClass = (mapping.assetClass !== -1 && row[mapping.assetClass]) ? row[mapping.assetClass].trim() : 'Equities (US)';
      const sector = (mapping.sector !== -1 && row[mapping.sector]) ? row[mapping.sector].trim() : 'Technology';

      const rawQty = mapping.quantity !== -1 ? row[mapping.quantity] : '0';
      const rawBuy = mapping.buyPrice !== -1 ? row[mapping.buyPrice] : '0';
      const rawCurrent = mapping.currentPrice !== -1 ? row[mapping.currentPrice] : rawBuy;

      const quantity = parseFloat(rawQty ? rawQty.replace(/[^0-9.-]/g, '') : '0');
      const buyPrice = parseFloat(rawBuy ? rawBuy.replace(/[^0-9.-]/g, '') : '0');
      const currentPrice = parseFloat(rawCurrent ? rawCurrent.replace(/[^0-9.-]/g, '') : `${buyPrice}`);

      const beta = mapping.beta !== -1 && row[mapping.beta] ? parseFloat(row[mapping.beta]) : 1.0;
      const volatility = mapping.volatility !== -1 && row[mapping.volatility] ? parseFloat(row[mapping.volatility]) : 0.18;
      const liquidity = mapping.liquidity !== -1 && row[mapping.liquidity] ? row[mapping.liquidity].toLowerCase() : 'high';

      // Validation rules
      const rowErrors = [];
      if (!symbol) rowErrors.push('Missing Symbol/Ticker');
      if (isNaN(quantity) || quantity <= 0) rowErrors.push('Quantity must be > 0');
      if (isNaN(buyPrice) || buyPrice < 0) rowErrors.push('Buy Price must be >= 0');
      if (isNaN(currentPrice) || currentPrice < 0) rowErrors.push('Current Price must be >= 0');

      const isDuplicate = seenSymbols.has(symbol);
      if (isDuplicate) {
        rowErrors.push(`Duplicate ticker ${symbol} in file`);
      } else if (symbol) {
        seenSymbols.add(symbol);
      }

      if (rowErrors.length > 0) {
        errors.push({ rowNum, errors: rowErrors, rawRow: row });
      }

      validated.push({
        id: 'imp_' + Math.random().toString(36).substring(2, 9),
        rowNum,
        symbol: symbol || 'UNKNOWN',
        name: name || symbol || 'Imported Holding',
        assetClass,
        sector,
        quantity: isNaN(quantity) ? 0 : quantity,
        buyPrice: isNaN(buyPrice) ? 0 : buyPrice,
        currentPrice: isNaN(currentPrice) ? (isNaN(buyPrice) ? 0 : buyPrice) : currentPrice,
        beta: isNaN(beta) ? 1.0 : beta,
        volatility: isNaN(volatility) ? 0.18 : volatility,
        liquidity: ['high', 'medium', 'low'].includes(liquidity) ? liquidity : 'high',
        currency: 'USD',
        region: 'North America',
        isValid: rowErrors.length === 0,
        errors: rowErrors,
      });
    });

    return { validated, errors };
  }

  /**
   * Generate a sample CSV template for download
   */
  static getSampleCSV() {
    return `Symbol,Name,Asset Class,Sector,Quantity,Buy Price,Current Price,Beta,Volatility,Liquidity
AAPL,Apple Inc.,Equities (US),Technology,100,165.00,225.00,1.15,0.22,high
MSFT,Microsoft Corp,Equities (US),Technology,75,320.00,415.00,1.10,0.20,high
JNJ,Johnson & Johnson,Equities (US),Healthcare,90,152.00,160.00,0.58,0.13,high
TLT,iShares 20+ Year Treasury,Fixed Income (Govt),Government,200,95.00,92.00,-0.25,0.15,high
GLD,SPDR Gold Shares,Precious Metals,Materials,60,190.00,240.00,0.08,0.14,high
USD_CASH,Cash Sweep,Cash & Equivalents,Cash,10000,1.00,1.00,0.00,0.001,high`;
  }
}
