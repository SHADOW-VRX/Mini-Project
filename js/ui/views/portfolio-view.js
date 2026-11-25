/**
 * PORTFOLIO CRASH THEATRE — PORTFOLIO VIEW CONTROLLER
 * Holdings CRUD, search, filter, sort, CSV import wizard, snapshots, and preset management.
 */

import { formatCurrency, formatPercent } from '../../portfolio/calculations.js';
import { CSVImporter } from '../../portfolio/csv-importer.js';
import { ModalManager } from '../modal.js';
import { notifications } from '../notifications.js';
import { storage } from '../../storage.js';
import { APP_CONFIG } from '../../config.js';

export class PortfolioView {
  constructor(state, portfolioManager) {
    this.state = state;
    this.pm = portfolioManager;

    this.tbody = document.getElementById('holdings-tbody');
    this.searchInput = document.getElementById('portfolio-search');
    this.classFilter = document.getElementById('filter-asset-class');
    this.sectorFilter = document.getElementById('filter-sector');
    this.presetSelector = document.getElementById('preset-portfolio-selector');

    this.sortKey = 'currentValue';
    this.sortAsc = false;

    this.csvParsedData = null;
    this.csvMapping = null;

    this._populateDropdowns();
    this._bindEvents();
  }

  _populateDropdowns() {
    // Populate Asset Class filter & modal select
    const modalClassSelect = document.getElementById('holding-asset-class');
    if (this.classFilter) {
      APP_CONFIG.assetClasses.forEach(ac => {
        const opt = document.createElement('option');
        opt.value = ac;
        opt.textContent = ac;
        this.classFilter.appendChild(opt);
      });
    }
    if (modalClassSelect) {
      modalClassSelect.innerHTML = '';
      APP_CONFIG.assetClasses.forEach(ac => {
        const opt = document.createElement('option');
        opt.value = ac;
        opt.textContent = ac;
        modalClassSelect.appendChild(opt);
      });
    }

    // Populate Sector filter & modal select
    const modalSectorSelect = document.getElementById('holding-sector');
    if (this.sectorFilter) {
      APP_CONFIG.sectors.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec;
        opt.textContent = sec;
        this.sectorFilter.appendChild(opt);
      });
    }
    if (modalSectorSelect) {
      modalSectorSelect.innerHTML = '';
      APP_CONFIG.sectors.forEach(sec => {
        const opt = document.createElement('option');
        opt.value = sec;
        opt.textContent = sec;
        modalSectorSelect.appendChild(opt);
      });
    }
  }

  _bindEvents() {
    // Search & Filter
    this.searchInput?.addEventListener('input', () => this.render());
    this.classFilter?.addEventListener('change', () => this.render());
    this.sectorFilter?.addEventListener('change', () => this.render());

    // Preset switcher
    this.presetSelector?.addEventListener('change', e => {
      this.pm.loadPreset(e.target.value);
      notifications.success('Preset Loaded', `Switched to ${e.target.options[e.target.selectedIndex].text}`);
    });

    // Table sorting
    document.querySelectorAll('#table-holdings th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-sort');
        if (this.sortKey === key) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortKey = key;
          this.sortAsc = false;
        }
        this.render();
      });
    });

    // Add Holding Button
    document.getElementById('btn-open-add-holding')?.addEventListener('click', () => {
      this._openHoldingModal();
    });

    // Holding Form Submit
    document.getElementById('form-holding')?.addEventListener('submit', e => {
      e.preventDefault();
      this._saveHoldingForm();
    });

    document.getElementById('btn-close-holding-modal')?.addEventListener('click', () => ModalManager.close('modal-holding'));
    document.getElementById('btn-cancel-holding')?.addEventListener('click', () => ModalManager.close('modal-holding'));

    // CSV Import Modal
    document.getElementById('btn-open-csv-modal')?.addEventListener('click', () => {
      this._resetCSVModal();
      ModalManager.open('modal-csv');
    });
    document.getElementById('btn-close-csv-modal')?.addEventListener('click', () => ModalManager.close('modal-csv'));
    document.getElementById('btn-cancel-csv')?.addEventListener('click', () => ModalManager.close('modal-csv'));

    // CSV Dropzone & File Browse
    const dropzone = document.getElementById('csv-dropzone');
    const fileInput = document.getElementById('csv-file-input');
    const browseBtn = document.getElementById('btn-browse-csv');

    browseBtn?.addEventListener('click', () => fileInput?.click());
    dropzone?.addEventListener('click', e => {
      if (e.target !== browseBtn) fileInput?.click();
    });

    dropzone?.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('drag-active');
    });
    dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('drag-active'));
    dropzone?.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-active');
      if (e.dataTransfer.files?.length > 0) {
        this._handleCSVFile(e.dataTransfer.files[0]);
      }
    });

    fileInput?.addEventListener('change', e => {
      if (e.target.files?.length > 0) {
        this._handleCSVFile(e.target.files[0]);
      }
    });

    // Sample CSV download
    document.getElementById('btn-download-sample-csv')?.addEventListener('click', e => {
      e.stopPropagation();
      const content = CSVImporter.getSampleCSV();
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_sample_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Confirm CSV Import button
    document.getElementById('btn-confirm-csv-import')?.addEventListener('click', () => {
      this._confirmCSVImport();
    });

    // Snapshots Modal
    document.getElementById('btn-open-snapshots')?.addEventListener('click', () => {
      this._renderSnapshots();
      ModalManager.open('modal-snapshots');
    });
    document.getElementById('btn-close-snapshots-modal')?.addEventListener('click', () => ModalManager.close('modal-snapshots'));

    document.getElementById('btn-save-new-snapshot')?.addEventListener('click', () => {
      const nameInput = document.getElementById('snapshot-new-name');
      const name = nameInput?.value.trim();
      const activePort = this.pm.getActivePortfolio();
      const snap = storage.saveSnapshot(name, activePort);
      if (snap) {
        notifications.success('Snapshot Saved', `Saved version "${snap.name}"`);
        if (nameInput) nameInput.value = '';
        this._renderSnapshots();
      }
    });

    // Subscribe to portfolio changes
    this.state.on('portfolioChanged', () => this.render());
  }

  onEnter() {
    this.render();
  }

  render() {
    if (!this.tbody) return;
    const summary = this.pm.getActiveSummary();
    const sym = this.state.settings.currencySymbol || '$';

    let holdings = [...summary.holdings];

    // Filter by search query
    const query = this.searchInput?.value.toLowerCase().trim() || '';
    if (query) {
      holdings = holdings.filter(h =>
        h.symbol.toLowerCase().includes(query) ||
        h.name.toLowerCase().includes(query) ||
        h.sector.toLowerCase().includes(query)
      );
    }

    // Filter by asset class
    const selectedClass = this.classFilter?.value || '';
    if (selectedClass) {
      holdings = holdings.filter(h => h.assetClass === selectedClass);
    }

    // Filter by sector
    const selectedSector = this.sectorFilter?.value || '';
    if (selectedSector) {
      holdings = holdings.filter(h => h.sector === selectedSector);
    }

    // Sort holdings
    holdings.sort((a, b) => {
      let valA = a[this.sortKey];
      let valB = b[this.sortKey];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    this.tbody.innerHTML = '';
    if (holdings.length === 0) {
      this.tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" style="padding: 2rem;">No holdings found matching criteria.</td></tr>`;
      return;
    }

    holdings.forEach(h => {
      const tr = document.createElement('tr');
      const isProfit = h.unrealizedPL >= 0;

      tr.innerHTML = `
        <td>
          <div class="holding-symbol">
            <span>${h.symbol}</span>
            <span class="badge badge-default text-xs">${h.liquidity.toUpperCase()}</span>
          </div>
          <div class="holding-name">${h.name}</div>
        </td>
        <td>
          <div class="text-xs font-semibold text-primary">${h.assetClass}</div>
          <div class="text-xs text-muted">${h.sector}</div>
        </td>
        <td class="font-mono text-xs">${h.quantity.toLocaleString()}</td>
        <td class="font-mono text-xs">${formatCurrency(h.buyPrice, sym)}</td>
        <td class="font-mono text-xs font-bold">${formatCurrency(h.currentPrice, sym)}</td>
        <td class="font-mono text-xs font-bold text-primary">${formatCurrency(h.currentValue, sym)}</td>
        <td>
          <div class="weight-bar-cell">
            <span class="font-mono text-xs">${h.weight.toFixed(1)}%</span>
            <div class="weight-progress-track">
              <div class="weight-progress-fill" style="width: ${Math.min(h.weight, 100)}%;"></div>
            </div>
          </div>
        </td>
        <td>
          <div class="font-mono text-xs font-bold ${isProfit ? 'text-success' : 'text-danger'}">
            ${formatCurrency(h.unrealizedPL, sym)}
          </div>
          <div class="text-xs ${isProfit ? 'text-success' : 'text-danger'}">
            ${formatPercent(h.unrealizedPLPercent)}
          </div>
        </td>
        <td>
          <span class="text-xs font-mono">β ${h.beta.toFixed(2)}</span>
          <span class="text-xs text-muted font-mono">/ σ ${(h.volatility * 100).toFixed(0)}%</span>
        </td>
        <td>
          <div class="row-actions">
            <button class="btn-icon-cell edit-btn" title="Edit Holding" data-id="${h.id}">✎</button>
            <button class="btn-icon-cell delete-btn" title="Delete Holding" data-id="${h.id}">&times;</button>
          </div>
        </td>
      `;

      tr.querySelector('.edit-btn')?.addEventListener('click', () => this._openHoldingModal(h));
      tr.querySelector('.delete-btn')?.addEventListener('click', () => {
        if (confirm(`Remove holding ${h.symbol} (${h.name}) from portfolio?`)) {
          this.pm.deleteHolding(h.id);
          notifications.info('Holding Removed', `${h.symbol} has been deleted.`);
        }
      });

      this.tbody.appendChild(tr);
    });
  }

  _openHoldingModal(holding = null) {
    const titleEl = document.getElementById('modal-holding-title');
    const idInput = document.getElementById('holding-id');
    const symbolInput = document.getElementById('holding-symbol');
    const nameInput = document.getElementById('holding-name');
    const classSelect = document.getElementById('holding-asset-class');
    const sectorSelect = document.getElementById('holding-sector');
    const qtyInput = document.getElementById('holding-quantity');
    const buyInput = document.getElementById('holding-buy-price');
    const curInput = document.getElementById('holding-current-price');
    const betaInput = document.getElementById('holding-beta');
    const volInput = document.getElementById('holding-volatility');
    const liqSelect = document.getElementById('holding-liquidity');

    if (holding) {
      if (titleEl) titleEl.textContent = `Edit Holding: ${holding.symbol}`;
      if (idInput) idInput.value = holding.id;
      if (symbolInput) symbolInput.value = holding.symbol;
      if (nameInput) nameInput.value = holding.name;
      if (classSelect) classSelect.value = holding.assetClass;
      if (sectorSelect) sectorSelect.value = holding.sector;
      if (qtyInput) qtyInput.value = holding.quantity;
      if (buyInput) buyInput.value = holding.buyPrice;
      if (curInput) curInput.value = holding.currentPrice;
      if (betaInput) betaInput.value = holding.beta;
      if (volInput) volInput.value = holding.volatility;
      if (liqSelect) liqSelect.value = holding.liquidity;
    } else {
      if (titleEl) titleEl.textContent = 'Add Asset Holding';
      if (idInput) idInput.value = '';
      document.getElementById('form-holding')?.reset();
      if (betaInput) betaInput.value = '1.00';
      if (volInput) volInput.value = '0.18';
      if (liqSelect) liqSelect.value = 'high';
    }

    ModalManager.open('modal-holding');
  }

  _saveHoldingForm() {
    const id = document.getElementById('holding-id')?.value;
    const symbol = document.getElementById('holding-symbol')?.value.toUpperCase().trim();
    const name = document.getElementById('holding-name')?.value.trim();
    const assetClass = document.getElementById('holding-asset-class')?.value;
    const sector = document.getElementById('holding-sector')?.value;
    const quantity = parseFloat(document.getElementById('holding-quantity')?.value);
    const buyPrice = parseFloat(document.getElementById('holding-buy-price')?.value);
    const currentPrice = parseFloat(document.getElementById('holding-current-price')?.value);
    const beta = parseFloat(document.getElementById('holding-beta')?.value) || 1.0;
    const volatility = parseFloat(document.getElementById('holding-volatility')?.value) || 0.18;
    const liquidity = document.getElementById('holding-liquidity')?.value || 'high';

    if (!symbol || !name || isNaN(quantity) || isNaN(buyPrice)) {
      notifications.danger('Validation Error', 'Please complete all required fields with valid numbers.');
      return;
    }

    this.pm.saveHolding({
      id: id || undefined,
      symbol,
      name,
      assetClass,
      sector,
      quantity,
      buyPrice,
      currentPrice: isNaN(currentPrice) ? buyPrice : currentPrice,
      beta,
      volatility,
      liquidity,
      currency: 'USD',
      region: 'North America',
    });

    ModalManager.close('modal-holding');
    notifications.success('Holding Saved', `${symbol} updated successfully.`);
  }

  _resetCSVModal() {
    const section = document.getElementById('csv-mapping-section');
    const confirmBtn = document.getElementById('btn-confirm-csv-import');
    if (section) section.style.display = 'none';
    if (confirmBtn) confirmBtn.disabled = true;
    this.csvParsedData = null;
    this.csvMapping = null;
  }

  _handleCSVFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target.result;
        const { headers, dataRows } = CSVImporter.parseCSV(text);
        this.csvParsedData = { headers, dataRows };
        this.csvMapping = CSVImporter.guessColumnMapping(headers);

        this._renderCSVMappingInterface();
      } catch (err) {
        notifications.danger('CSV Parse Error', err.message);
      }
    };
    reader.readAsText(file);
  }

  _renderCSVMappingInterface() {
    const section = document.getElementById('csv-mapping-section');
    const grid = document.getElementById('csv-mapping-grid');
    const confirmBtn = document.getElementById('btn-confirm-csv-import');
    if (!section || !grid || !this.csvParsedData) return;

    section.style.display = 'block';
    grid.innerHTML = '';

    const fields = [
      { key: 'symbol', label: 'Symbol / Ticker *' },
      { key: 'name', label: 'Asset Name' },
      { key: 'assetClass', label: 'Asset Class' },
      { key: 'sector', label: 'Sector' },
      { key: 'quantity', label: 'Quantity *' },
      { key: 'buyPrice', label: 'Buy Price *' },
      { key: 'currentPrice', label: 'Current Price' },
    ];

    fields.forEach(f => {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'mapping-field';

      const label = document.createElement('label');
      label.textContent = f.label;

      const select = document.createElement('select');
      select.className = 'form-select';
      select.innerHTML = `<option value="-1">-- Unmapped --</option>`;

      this.csvParsedData.headers.forEach((h, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${idx + 1}. ${h}`;
        if (this.csvMapping[f.key] === idx) opt.selected = true;
        select.appendChild(opt);
      });

      select.addEventListener('change', () => {
        this.csvMapping[f.key] = parseInt(select.value, 10);
        this._updateCSVPreview();
      });

      fieldDiv.appendChild(label);
      fieldDiv.appendChild(select);
      grid.appendChild(fieldDiv);
    });

    this._updateCSVPreview();
  }

  _updateCSVPreview() {
    const thead = document.getElementById('csv-preview-thead');
    const tbody = document.getElementById('csv-preview-tbody');
    const confirmBtn = document.getElementById('btn-confirm-csv-import');
    if (!thead || !tbody || !this.csvParsedData) return;

    const { validated, errors } = CSVImporter.processImportRows(this.csvParsedData.dataRows, this.csvMapping);

    thead.innerHTML = `
      <tr>
        <th>Row</th>
        <th>Symbol</th>
        <th>Name</th>
        <th>Qty</th>
        <th>Buy Price</th>
        <th>Status</th>
      </tr>
    `;

    tbody.innerHTML = '';
    const validCount = validated.filter(r => r.isValid).length;

    validated.slice(0, 10).forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono text-xs">${row.rowNum}</td>
        <td class="font-bold text-xs">${row.symbol}</td>
        <td class="text-xs text-muted">${row.name}</td>
        <td class="font-mono text-xs">${row.quantity}</td>
        <td class="font-mono text-xs">${row.buyPrice}</td>
        <td>
          ${row.isValid
            ? `<span class="badge badge-success text-xs">Valid</span>`
            : `<span class="badge badge-danger text-xs" title="${row.errors.join(', ')}">Error: ${row.errors[0]}</span>`}
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (confirmBtn) {
      confirmBtn.disabled = validCount === 0;
      confirmBtn.textContent = `Import ${validCount} Valid Assets`;
    }
  }

  _confirmCSVImport() {
    if (!this.csvParsedData || !this.csvMapping) return;
    const { validated } = CSVImporter.processImportRows(this.csvParsedData.dataRows, this.csvMapping);
    const validHoldings = validated.filter(r => r.isValid);

    if (validHoldings.length === 0) {
      notifications.danger('Import Failed', 'No valid rows found to import.');
      return;
    }

    this.pm.importBatchHoldings(validHoldings, false);
    ModalManager.close('modal-csv');
    notifications.success('CSV Imported', `Successfully added ${validHoldings.length} assets to active portfolio.`);
  }

  _renderSnapshots() {
    const tbody = document.getElementById('snapshots-tbody');
    if (!tbody) return;
    const snapshots = storage.getSnapshots();

    tbody.innerHTML = '';
    if (snapshots.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted text-xs">No saved snapshots yet.</td></tr>`;
      return;
    }

    snapshots.forEach(snap => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-bold text-xs">${snap.name}</td>
        <td class="text-xs text-muted">${new Date(snap.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-xs btn-outline btn-restore-snap" data-id="${snap.id}">Restore</button>
          <button class="btn btn-xs btn-danger-outline btn-del-snap" data-id="${snap.id}">&times;</button>
        </td>
      `;

      tr.querySelector('.btn-restore-snap')?.addEventListener('click', () => {
        if (confirm(`Restore snapshot "${snap.name}"? Current unsaved modifications will be replaced.`)) {
          this.pm.saveHolding = null; // Reset
          const portfolios = storage.getPortfolios();
          const idx = portfolios.findIndex(p => p.id === snap.portfolio.id);
          if (idx !== -1) {
            portfolios[idx] = snap.portfolio;
          } else {
            portfolios.push(snap.portfolio);
          }
          storage.savePortfolios(portfolios);
          storage.setActivePortfolioId(snap.portfolio.id);
          this.state.emit('portfolioChanged', snap.portfolio);
          ModalManager.close('modal-snapshots');
          notifications.success('Snapshot Restored', `Portfolio restored to "${snap.name}".`);
        }
      });

      tr.querySelector('.btn-del-snap')?.addEventListener('click', () => {
        storage.deleteSnapshot(snap.id);
        this._renderSnapshots();
        notifications.info('Snapshot Deleted', `Removed "${snap.name}".`);
      });

      tbody.appendChild(tr);
    });
  }
}
