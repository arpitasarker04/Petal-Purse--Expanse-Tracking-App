(function () {
  "use strict";

  var STORAGE_KEY = "petalPurse.expenses";
  var BUDGET_KEY = "petalPurse.budget";
  var DEFAULT_BUDGET = 500;

  var PENCIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="M13.5 6.5l4 4"/></svg>';

  var CATEGORIES = [
    { id: "food", name: "Food & drink", color: "var(--rose-soft)", hex: "#E8919F",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9h11v5a5.5 5.5 0 0 1-5.5 5.5h0A5.5 5.5 0 0 1 6 14V9Z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M9 3.5v2M12 3.5v2M15 3.5v2"/></svg>' },
    { id: "shopping", name: "Shopping", color: "var(--rose-deep)", hex: "#C9668B",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8h11l1 12h-13l1-12Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>' },
    { id: "beauty", name: "Beauty", color: "var(--lavender)", hex: "#B79FCE",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.2"/><circle cx="12" cy="6.2" r="2"/><circle cx="12" cy="17.8" r="2"/><circle cx="6.2" cy="12" r="2"/><circle cx="17.8" cy="12" r="2"/></svg>' },
    { id: "travel", name: "Travel", color: "var(--dusty-blue)", hex: "#7FA9C9",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13.5 20 6l-6.5 14-2-6.5L3 13.5Z"/></svg>' },
    { id: "bills", name: "Bills", color: "var(--mauve-grey)", hex: "#9C8290",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h12v17l-2.5-1.5-2.5 1.5-2.5-1.5-2.5 1.5-2-1.5v-15Z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>' },
    { id: "fun", name: "Fun", color: "var(--gold)", hex: "#D9A85C",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3.5 14.4 9.8 21 10.4 16 14.6 17.6 21 12 17.4 6.4 21 8 14.6 3 10.4 9.6 9.8 12 3.5Z"/></svg>' },
    { id: "other", name: "Other", color: "var(--sage)", hex: "#A8B98C",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7 3 9 9 0 0 1 0 .1C19 15.6 12 20 12 20Z"/></svg>' }
  ];

  var els = {};
  var state = {
    expenses: [],
    budget: DEFAULT_BUDGET,
    selectedCategory: CATEGORIES[0].id,
    editingId: null
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      state.expenses = raw ? JSON.parse(raw) : [];
    } catch (e) {
      state.expenses = [];
    }
    try {
      var b = localStorage.getItem(BUDGET_KEY);
      state.budget = b ? parseFloat(b) : DEFAULT_BUDGET;
    } catch (e) {
      state.budget = DEFAULT_BUDGET;
    }
  }

  function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
  }

  function saveBudget() {
    localStorage.setItem(BUDGET_KEY, String(state.budget));
  }

  function findCategory(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) return CATEGORIES[i];
    }
    return CATEGORIES[CATEGORIES.length - 1];
  }

  function formatCurrency(n) {
    return "$" + (Math.round(n * 100) / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function isSameMonth(dateStr, ref) {
    var d = new Date(dateStr + "T00:00:00");
    return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
  }

  function currentMonthExpenses() {
    var now = new Date();
    return state.expenses.filter(function (e) {
      return isSameMonth(e.date, now);
    });
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  /* ---------------- rendering ---------------- */

  function renderChips() {
    els.categoryChips.innerHTML = "";
    CATEGORIES.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip" + (cat.id === state.selectedCategory ? " selected" : "");
      btn.style.setProperty("--cat-color", cat.hex);
      btn.setAttribute("aria-pressed", cat.id === state.selectedCategory ? "true" : "false");
      btn.innerHTML = cat.icon + "<span>" + cat.name + "</span>";
      btn.addEventListener("click", function () {
        state.selectedCategory = cat.id;
        renderChips();
      });
      els.categoryChips.appendChild(btn);
    });
  }

  function renderHero() {
    var monthTotal = currentMonthExpenses().reduce(function (sum, e) {
      return sum + e.amount;
    }, 0);

    els.totalSpent.textContent = formatCurrency(monthTotal);
    els.budgetInput.value = state.budget;

    var pct = state.budget > 0 ? Math.min(100, (monthTotal / state.budget) * 100) : 0;
    els.progressFill.style.width = pct + "%";

    var over = monthTotal > state.budget && state.budget > 0;
    els.progressFill.classList.toggle("over", over);
    els.progressTrack.setAttribute("aria-valuenow", Math.round(pct));

    if (state.budget <= 0) {
      els.progressNote.textContent = "Set a monthly goal to track your progress.";
    } else if (over) {
      els.progressNote.textContent = formatCurrency(monthTotal - state.budget) + " over your goal this month.";
    } else {
      els.progressNote.textContent = formatCurrency(state.budget - monthTotal) + " left before you hit your goal.";
    }
  }

  function renderBreakdown() {
    var monthExpenses = currentMonthExpenses();
    var totals = {};
    var total = 0;

    monthExpenses.forEach(function (e) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      total += e.amount;
    });

    var hasData = total > 0;
    els.breakdownEmpty.classList.toggle("visible", !hasData);
    els.donutChart.style.display = hasData ? "flex" : "none";
    els.legendList.style.display = hasData ? "flex" : "none";

    if (!hasData) return;

    var gradientParts = [];
    var cursor = 0;

    els.legendList.innerHTML = "";

    CATEGORIES.forEach(function (cat) {
      var amt = totals[cat.id];
      if (!amt) return;
      var slice = (amt / total) * 360;
      gradientParts.push(cat.hex + " " + cursor + "deg " + (cursor + slice) + "deg");
      cursor += slice;

      var li = document.createElement("li");
      var pct = Math.round((amt / total) * 100);
      li.innerHTML =
        '<span class="legend-dot" style="background:' + cat.hex + '"></span>' +
        '<span class="legend-name">' + cat.name + "</span>" +
        '<span class="legend-percent">' + pct + "%</span>" +
        '<span class="legend-amount">' + formatCurrency(amt) + "</span>";
      els.legendList.appendChild(li);
    });

    var donutInner = els.donutChart.querySelector(".donut-center");
    els.donutChart.style.background = "conic-gradient(" + gradientParts.join(", ") + ")";
    els.donutChart.innerHTML = "";
    els.donutChart.appendChild(donutInner);
    els.donutCenterAmount.textContent = formatCurrency(total);
  }

  function renderLedger() {
    var sorted = state.expenses.slice().sort(function (a, b) {
      return b.date.localeCompare(a.date) || b.id - a.id;
    });

    els.ledgerEmpty.classList.toggle("visible", sorted.length === 0);
    els.ledgerList.innerHTML = "";

    sorted.forEach(function (e) {
      var cat = findCategory(e.category);
      var row = document.createElement("div");
      row.className = "ledger-row";
      row.innerHTML =
        '<div class="ledger-icon" style="background:' + cat.hex + '">' + cat.icon + "</div>" +
        '<div class="ledger-info">' +
          '<div class="ledger-note">' + escapeHtml(e.note || cat.name) + "</div>" +
          '<div class="ledger-meta">' + cat.name + " · " + formatDate(e.date) + "</div>" +
        "</div>" +
        '<div class="ledger-amount">' + formatCurrency(e.amount) + "</div>" +
        '<button class="ledger-edit" aria-label="Edit entry" data-id="' + e.id + '">' + PENCIL_ICON + "</button>" +
        '<button class="ledger-delete" aria-label="Delete entry" data-id="' + e.id + '">&times;</button>';
      els.ledgerList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderAll() {
    renderHero();
    renderBreakdown();
    renderLedger();
  }

  /* ---------------- editing ---------------- */

  function startEdit(id) {
    var entry = state.expenses.find(function (e) { return e.id === id; });
    if (!entry) return;
    state.editingId = id;
    els.amountInput.value = entry.amount;
    els.dateInput.value = entry.date;
    els.noteInput.value = entry.note;
    state.selectedCategory = entry.category;
    renderChips();
    els.submitBtn.textContent = "Update expense";
    els.cancelEditBtn.hidden = false;
    els.amountInput.focus();
  }

  function cancelEdit() {
    state.editingId = null;
    els.submitBtn.textContent = "Add to ledger";
    els.cancelEditBtn.hidden = true;
    els.expenseForm.reset();
    els.dateInput.value = todayStr();
    state.selectedCategory = CATEGORIES[0].id;
    renderChips();
  }

  /* ---------------- CSV export ---------------- */

  function exportCSV() {
    var rows = [["Date", "Category", "Note", "Amount"]];
    state.expenses.slice().sort(function (a, b) {
      return a.date.localeCompare(b.date);
    }).forEach(function (e) {
      var cat = findCategory(e.category);
      rows.push([e.date, cat.name, e.note || "", e.amount.toFixed(2)]);
    });

    var csv = rows.map(function (r) {
      return r.map(function (field) {
        var f = String(field).replace(/"/g, '""');
        return /[",\n]/.test(f) ? '"' + f + '"' : f;
      }).join(",");
    }).join("\n");

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "petal-purse-expenses.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------------- events ---------------- */

  function handleSubmit(evt) {
    evt.preventDefault();
    var amount = parseFloat(els.amountInput.value);
    if (!amount || amount <= 0) {
      els.amountInput.focus();
      return;
    }
    var date = els.dateInput.value || todayStr();

    if (state.editingId) {
      var entry = state.expenses.find(function (e) { return e.id === state.editingId; });
      if (entry) {
        entry.amount = amount;
        entry.category = state.selectedCategory;
        entry.note = els.noteInput.value.trim();
        entry.date = date;
      }
      cancelEdit();
    } else {
      state.expenses.push({
        id: Date.now(),
        amount: amount,
        category: state.selectedCategory,
        note: els.noteInput.value.trim(),
        date: date
      });
      els.amountInput.value = "";
      els.noteInput.value = "";
      els.amountInput.focus();
    }

    saveExpenses();
    renderAll();
  }

  function handleLedgerClick(evt) {
    var editBtn = evt.target.closest(".ledger-edit");
    if (editBtn) {
      startEdit(Number(editBtn.getAttribute("data-id")));
      return;
    }
    var delBtn = evt.target.closest(".ledger-delete");
    if (delBtn) {
      var id = Number(delBtn.getAttribute("data-id"));
      state.expenses = state.expenses.filter(function (e) {
        return e.id !== id;
      });
      if (state.editingId === id) cancelEdit();
      saveExpenses();
      renderAll();
    }
  }

  function handleBudgetChange() {
    var val = parseFloat(els.budgetInput.value);
    state.budget = isNaN(val) || val < 0 ? 0 : val;
    saveBudget();
    renderHero();
  }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /* ---------------- splash screen ---------------- */

  function initSplash() {
    var splash = document.getElementById("splashScreen");
    if (!splash) return;

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add("hide");
      splash.removeEventListener("click", dismiss);
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var delay = reduceMotion ? 0 : 1500;

    setTimeout(dismiss, delay);
    // Safety net: if anything stalls the timer (backgrounded tab, etc.), clicking always works.
    splash.addEventListener("click", dismiss);
    // Extra safety net: never let it stay up longer than 4 seconds no matter what.
    setTimeout(dismiss, 4000);
  }

  function init() {
    els.totalSpent = document.getElementById("totalSpent");
    els.budgetInput = document.getElementById("budgetInput");
    els.progressFill = document.getElementById("progressFill");
    els.progressTrack = document.getElementById("progressTrack");
    els.progressNote = document.getElementById("progressNote");
    els.expenseForm = document.getElementById("expenseForm");
    els.amountInput = document.getElementById("amountInput");
    els.dateInput = document.getElementById("dateInput");
    els.noteInput = document.getElementById("noteInput");
    els.categoryChips = document.getElementById("categoryChips");
    els.submitBtn = document.getElementById("submitBtn");
    els.cancelEditBtn = document.getElementById("cancelEditBtn");
    els.donutChart = document.getElementById("donutChart");
    els.donutCenterAmount = document.getElementById("donutCenterAmount");
    els.legendList = document.getElementById("legendList");
    els.breakdownEmpty = document.getElementById("breakdownEmpty");
    els.ledgerList = document.getElementById("ledgerList");
    els.ledgerEmpty = document.getElementById("ledgerEmpty");
    els.exportBtn = document.getElementById("exportBtn");

    load();
    els.dateInput.value = todayStr();

    renderChips();
    renderAll();
    initSplash();

    els.expenseForm.addEventListener("submit", handleSubmit);
    els.ledgerList.addEventListener("click", handleLedgerClick);
    els.budgetInput.addEventListener("change", handleBudgetChange);
    els.cancelEditBtn.addEventListener("click", cancelEdit);
    els.exportBtn.addEventListener("click", exportCSV);
  }

  document.addEventListener("DOMContentLoaded", init);
})();