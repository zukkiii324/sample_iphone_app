(function () {
  'use strict';

  var MAX_TSUMITATE_YEARLY = 1200000;
  var MAX_GROWTH_YEARLY = 2400000;
  var MAX_TOTAL_YEARLY = 3600000;
  var MAX_LIFETIME_TOTAL = 18000000;
  var MAX_LIFETIME_GROWTH = 12000000;

  var inputs = {
    years: document.getElementById('years'),
    initialInvestment: document.getElementById('initialInvestment'),
    returnRate: document.getElementById('returnRate'),
    feeRate: document.getElementById('feeRate'),
    volatility: document.getElementById('volatility'),
    annualIncreaseRate: document.getElementById('annualIncreaseRate'),
    monthlyTsumitate: document.getElementById('monthlyTsumitate'),
    monthlyGrowth: document.getElementById('monthlyGrowth'),
    bonus: document.getElementById('bonus'),
    taxRate: document.getElementById('taxRate'),
    withdrawYears: document.getElementById('withdrawYears')
  };

  var limitNote = document.getElementById('limitNote');
  var runBtn = document.getElementById('runBtn');
  var addCaseBtn = document.getElementById('addCaseBtn');
  var yearlyTable = document.getElementById('yearlyTable');
  var caseList = document.getElementById('caseList');
  var presetButtons = document.querySelectorAll('[data-preset]');

  var output = {
    principal: document.getElementById('principal'),
    nisaValue: document.getElementById('nisaValue'),
    taxableValue: document.getElementById('taxableValue'),
    advantage: document.getElementById('advantage'),
    monthlyWithdraw: document.getElementById('monthlyWithdraw')
  };

  var cases = [];

  function yen(value) {
    return Math.round(value).toLocaleString('ja-JP') + '円';
  }

  function safeNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function parseSettings() {
    return {
      years: Math.max(1, safeNumber(inputs.years.value, 20)),
      initialInvestment: Math.max(0, safeNumber(inputs.initialInvestment.value, 0)),
      returnRate: safeNumber(inputs.returnRate.value, 5) / 100,
      feeRate: safeNumber(inputs.feeRate.value, 0.2) / 100,
      volatility: Math.max(0, safeNumber(inputs.volatility.value, 8)) / 100,
      annualIncreaseRate: Math.max(0, safeNumber(inputs.annualIncreaseRate.value, 0)) / 100,
      monthlyTsumitate: Math.max(0, safeNumber(inputs.monthlyTsumitate.value, 50000)),
      monthlyGrowth: Math.max(0, safeNumber(inputs.monthlyGrowth.value, 30000)),
      bonus: Math.max(0, safeNumber(inputs.bonus.value, 100000)),
      taxRate: Math.max(0, safeNumber(inputs.taxRate.value, 20.315)) / 100,
      withdrawYears: Math.max(0, safeNumber(inputs.withdrawYears.value, 0))
    };
  }

  function getYearlyPlan(settings, yearIndex) {
    var multiplier = Math.pow(1 + settings.annualIncreaseRate, yearIndex);
    return {
      tsumitate: settings.monthlyTsumitate * 12 * multiplier,
      growth: (settings.monthlyGrowth * 12 + settings.bonus * 2) * multiplier
    };
  }

  function showLimitNote(settings) {
    var firstYear = getYearlyPlan(settings, 0);
    var messages = [];

    if (firstYear.tsumitate > MAX_TSUMITATE_YEARLY) {
      messages.push('初年度のつみたて投資枠が年間上限（120万円）を超えています。');
    }
    if (firstYear.growth > MAX_GROWTH_YEARLY) {
      messages.push('初年度の成長投資枠が年間上限（240万円）を超えています。');
    }
    if (firstYear.tsumitate + firstYear.growth > MAX_TOTAL_YEARLY) {
      messages.push('初年度の年間投資額が新NISA上限（360万円）を超えています。');
    }
    if (settings.annualIncreaseRate > 0) {
      messages.push('毎年の積立増額を設定しているため、将来は上限超過が起こりやすくなります。');
    }

    limitNote.textContent = messages.length > 0
      ? messages.join(' ')
      : '初年度は新NISAの年間上限内です。将来年もテーブルで上限超過の有無をご確認ください。';
  }

  function allocateNisa(plan, lifetime) {
    var yearlyTsumitate = Math.min(plan.tsumitate, MAX_TSUMITATE_YEARLY);
    var yearlyGrowth = Math.min(plan.growth, MAX_GROWTH_YEARLY);

    if (yearlyTsumitate + yearlyGrowth > MAX_TOTAL_YEARLY) {
      yearlyGrowth = MAX_TOTAL_YEARLY - yearlyTsumitate;
    }

    var availableGrowth = Math.max(0, MAX_LIFETIME_GROWTH - lifetime.growth);
    var availableTotal = Math.max(0, MAX_LIFETIME_TOTAL - lifetime.total);

    var nisaGrowth = Math.min(yearlyGrowth, availableGrowth, availableTotal);
    var nisaTsumitate = Math.min(yearlyTsumitate, Math.max(0, availableTotal - nisaGrowth));

    return {
      nisaInvest: nisaTsumitate + nisaGrowth,
      taxableInvest: Math.max(0, plan.tsumitate + plan.growth - (nisaTsumitate + nisaGrowth)),
      nisaTsumitate: nisaTsumitate,
      nisaGrowth: nisaGrowth
    };
  }

  function pickRate(baseRate, volatility, year, variant) {
    var waveA = Math.sin((year + variant * 0.7) * 1.35);
    var waveB = Math.cos((year + variant * 1.1) * 0.75);
    var pseudo = (waveA + waveB) / 2;
    return baseRate + pseudo * volatility;
  }

  function simulate(settings) {
    var nisaAccount = settings.initialInvestment;
    var overflowTaxable = 0;
    var fullTaxable = settings.initialInvestment;
    var principal = settings.initialInvestment;
    var yearly = [];
    var lifetime = { total: 0, growth: 0 };

    for (var year = 1; year <= settings.years; year += 1) {
      var plan = getYearlyPlan(settings, year - 1);
      var alloc = allocateNisa(plan, lifetime);

      lifetime.total += alloc.nisaInvest;
      lifetime.growth += alloc.nisaGrowth;

      var grossRate = pickRate(settings.returnRate, settings.volatility, year, 1);
      var netRate = grossRate - settings.feeRate;
      var taxableNetRate = netRate * (1 - settings.taxRate);

      nisaAccount = (nisaAccount + alloc.nisaInvest) * (1 + netRate);
      overflowTaxable = (overflowTaxable + alloc.taxableInvest) * (1 + taxableNetRate);
      fullTaxable = (fullTaxable + plan.tsumitate + plan.growth) * (1 + taxableNetRate);

      principal += plan.tsumitate + plan.growth;

      yearly.push({
        year: year,
        principal: principal,
        nisa: nisaAccount + overflowTaxable,
        taxableOnly: fullTaxable,
        isOverLimit: alloc.taxableInvest > 0
      });
    }

    var nisaTotal = nisaAccount + overflowTaxable;
    var advantage = nisaTotal - fullTaxable;
    var monthlyWithdraw = settings.withdrawYears > 0
      ? nisaTotal / (settings.withdrawYears * 12)
      : 0;

    return {
      principal: principal,
      nisaValue: nisaTotal,
      taxableValue: fullTaxable,
      advantage: advantage,
      monthlyWithdraw: monthlyWithdraw,
      yearly: yearly
    };
  }

  function renderTable(rows) {
    yearlyTable.innerHTML = rows.map(function (row) {
      var badge = row.isOverLimit ? ' ⚠️' : '';
      return '<tr><td>' + row.year + badge + '</td><td>' + yen(row.principal) + '</td><td>' + yen(row.nisa) + '</td><td>' + yen(row.taxableOnly) + '</td></tr>';
    }).join('');
  }

  function renderSummary(result) {
    output.principal.textContent = yen(result.principal);
    output.nisaValue.textContent = yen(result.nisaValue);
    output.taxableValue.textContent = yen(result.taxableValue);
    output.advantage.textContent = yen(result.advantage);
    output.monthlyWithdraw.textContent = result.monthlyWithdraw > 0
      ? yen(result.monthlyWithdraw)
      : '取り崩し設定なし';
  }

  function updateSimulation() {
    var settings = parseSettings();
    showLimitNote(settings);
    var result = simulate(settings);
    renderSummary(result);
    renderTable(result.yearly);
    return { settings: settings, result: result };
  }

  function renderCases() {
    if (cases.length === 0) {
      caseList.innerHTML = '<p class="note">まだ比較ケースがありません。まずは条件を設定して「比較ケースに追加」を押してください。</p>';
      return;
    }

    caseList.innerHTML = cases.map(function (item, index) {
      return (
        '<article class="case-card">' +
        '<h3>ケース' + (index + 1) + '</h3>' +
        '<p>運用年数: ' + item.settings.years + '年</p>' +
        '<p>年率: ' + (item.settings.returnRate * 100).toFixed(1) + '% / 手数料: ' + (item.settings.feeRate * 100).toFixed(2) + '%</p>' +
        '<p>毎月合計: ' + yen(item.settings.monthlyTsumitate + item.settings.monthlyGrowth) + '</p>' +
        '<p>最終評価額: <strong>' + yen(item.result.nisaValue) + '</strong></p>' +
        '<p>新NISA優位: <strong>' + yen(item.result.advantage) + '</strong></p>' +
        '</article>'
      );
    }).join('');
  }

  function applyPreset(type) {
    if (type === 'safety') {
      inputs.returnRate.value = '3.0';
      inputs.feeRate.value = '0.2';
      inputs.volatility.value = '4';
      inputs.monthlyTsumitate.value = '30000';
      inputs.monthlyGrowth.value = '10000';
      inputs.bonus.value = '50000';
    } else if (type === 'balanced') {
      inputs.returnRate.value = '5.0';
      inputs.feeRate.value = '0.2';
      inputs.volatility.value = '8';
      inputs.monthlyTsumitate.value = '50000';
      inputs.monthlyGrowth.value = '30000';
      inputs.bonus.value = '100000';
    } else if (type === 'growth') {
      inputs.returnRate.value = '7.0';
      inputs.feeRate.value = '0.3';
      inputs.volatility.value = '14';
      inputs.monthlyTsumitate.value = '80000';
      inputs.monthlyGrowth.value = '70000';
      inputs.bonus.value = '200000';
    }
    updateSimulation();
  }

  runBtn.addEventListener('click', updateSimulation);

  addCaseBtn.addEventListener('click', function () {
    var current = updateSimulation();
    cases.push(current);
    if (cases.length > 6) {
      cases.shift();
    }
    renderCases();
  });

  presetButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyPreset(button.getAttribute('data-preset'));
    });
  });

  Object.keys(inputs).forEach(function (key) {
    inputs[key].addEventListener('change', updateSimulation);
  });

  updateSimulation();
  renderCases();
})();
