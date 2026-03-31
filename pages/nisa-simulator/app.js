(function () {
  'use strict';

  var MAX_TSUMITATE_YEARLY = 1200000;
  var MAX_GROWTH_YEARLY = 2400000;
  var MAX_TOTAL_YEARLY = 3600000;

  var inputs = {
    years: document.getElementById('years'),
    returnRate: document.getElementById('returnRate'),
    feeRate: document.getElementById('feeRate'),
    volatility: document.getElementById('volatility'),
    monthlyTsumitate: document.getElementById('monthlyTsumitate'),
    monthlyGrowth: document.getElementById('monthlyGrowth'),
    bonus: document.getElementById('bonus'),
    taxRate: document.getElementById('taxRate')
  };

  var limitNote = document.getElementById('limitNote');
  var runBtn = document.getElementById('runBtn');
  var addCaseBtn = document.getElementById('addCaseBtn');
  var yearlyTable = document.getElementById('yearlyTable');
  var caseList = document.getElementById('caseList');

  var output = {
    principal: document.getElementById('principal'),
    nisaValue: document.getElementById('nisaValue'),
    taxableValue: document.getElementById('taxableValue'),
    advantage: document.getElementById('advantage')
  };

  var cases = [];

  function yen(value) {
    return Math.round(value).toLocaleString('ja-JP') + '円';
  }

  function parseSettings() {
    return {
      years: Number(inputs.years.value),
      returnRate: Number(inputs.returnRate.value) / 100,
      feeRate: Number(inputs.feeRate.value) / 100,
      volatility: Number(inputs.volatility.value) / 100,
      monthlyTsumitate: Number(inputs.monthlyTsumitate.value),
      monthlyGrowth: Number(inputs.monthlyGrowth.value),
      bonus: Number(inputs.bonus.value),
      taxRate: Number(inputs.taxRate.value) / 100
    };
  }

  function showLimitNote(settings) {
    var yearlyTsumitate = settings.monthlyTsumitate * 12;
    var yearlyGrowth = settings.monthlyGrowth * 12 + settings.bonus * 2;
    var yearlyTotal = yearlyTsumitate + yearlyGrowth;

    var messages = [];

    if (yearlyTsumitate > MAX_TSUMITATE_YEARLY) {
      messages.push('つみたて投資枠が年間上限（120万円）を超えています。');
    }
    if (yearlyGrowth > MAX_GROWTH_YEARLY) {
      messages.push('成長投資枠が年間上限（240万円）を超えています。');
    }
    if (yearlyTotal > MAX_TOTAL_YEARLY) {
      messages.push('年間投資額の合計が新NISA上限（360万円）を超えています。');
    }

    if (messages.length === 0) {
      limitNote.textContent = '新NISAの年間上限内で設定されています。';
      return;
    }

    limitNote.textContent = messages.join(' ');
  }

  function clampForNisa(settings) {
    var yearlyTsumitate = Math.min(settings.monthlyTsumitate * 12, MAX_TSUMITATE_YEARLY);
    var yearlyGrowth = Math.min(settings.monthlyGrowth * 12 + settings.bonus * 2, MAX_GROWTH_YEARLY);

    if (yearlyTsumitate + yearlyGrowth > MAX_TOTAL_YEARLY) {
      yearlyGrowth = MAX_TOTAL_YEARLY - yearlyTsumitate;
    }

    return {
      yearlyNisaInvest: Math.max(0, yearlyTsumitate + yearlyGrowth),
      yearlyTotalInvest: settings.monthlyTsumitate * 12 + settings.monthlyGrowth * 12 + settings.bonus * 2
    };
  }

  function pickRate(baseRate, volatility, year, variant) {
    var waveA = Math.sin((year + variant * 1.3) * 1.7);
    var waveB = Math.cos((year + variant * 0.8) * 0.9);
    var randomLike = (waveA + waveB) / 2;
    return baseRate + randomLike * volatility;
  }

  function simulate(settings) {
    var nisa = 0;
    var overflowTaxable = 0;
    var fullTaxable = 0;
    var principal = 0;
    var yearly = [];
    var yearlyInvest = clampForNisa(settings);

    for (var year = 1; year <= settings.years; year += 1) {
      var grossRate = pickRate(settings.returnRate, settings.volatility, year, 1);
      var netRate = grossRate - settings.feeRate;
      var taxableNetRate = netRate * (1 - settings.taxRate);

      var invest = yearlyInvest.yearlyTotalInvest;
      var nisaInvest = yearlyInvest.yearlyNisaInvest;
      var taxableInvest = Math.max(0, invest - nisaInvest);

      nisa = (nisa + nisaInvest) * (1 + netRate);
      overflowTaxable = (overflowTaxable + taxableInvest) * (1 + taxableNetRate);
      fullTaxable = (fullTaxable + invest) * (1 + taxableNetRate);
      principal += invest;

      yearly.push({
        year: year,
        principal: principal,
        nisa: nisa + overflowTaxable,
        taxableOnly: fullTaxable
      });
    }

    return {
      principal: principal,
      nisaValue: nisa + overflowTaxable,
      taxableValue: fullTaxable,
      advantage: (nisa + overflowTaxable) - fullTaxable,
      yearly: yearly
    };
  }

  function renderTable(rows) {
    yearlyTable.innerHTML = rows.map(function (row) {
      return '<tr><td>' + row.year + '</td><td>' + yen(row.principal) + '</td><td>' + yen(row.nisa) + '</td><td>' + yen(row.taxableOnly) + '</td></tr>';
    }).join('');
  }

  function renderSummary(result) {
    output.principal.textContent = yen(result.principal);
    output.nisaValue.textContent = yen(result.nisaValue);
    output.taxableValue.textContent = yen(result.taxableValue);
    output.advantage.textContent = yen(result.advantage);
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

  runBtn.addEventListener('click', updateSimulation);
  addCaseBtn.addEventListener('click', function () {
    var current = updateSimulation();
    cases.push(current);
    if (cases.length > 6) {
      cases.shift();
    }
    renderCases();
  });

  Object.keys(inputs).forEach(function (key) {
    inputs[key].addEventListener('change', updateSimulation);
  });

  updateSimulation();
  renderCases();
})();
