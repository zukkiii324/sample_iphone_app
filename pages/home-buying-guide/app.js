(function () {
  const deductionRate = 0.007;
  const residentTaxCap = 97500;

  const deductionRules = {
    "new-longterm": {
      2026: { limit: 45000000, years: 13 },
      2025: { limit: 45000000, years: 13 },
      2024: { limit: 50000000, years: 13 },
      2023: { limit: 50000000, years: 13 }
    },
    "new-zseh": {
      2026: { limit: 35000000, years: 13 },
      2025: { limit: 35000000, years: 13 },
      2024: { limit: 45000000, years: 13 },
      2023: { limit: 45000000, years: 13 }
    },
    "new-energy": {
      2026: { limit: 30000000, years: 13 },
      2025: { limit: 30000000, years: 13 },
      2024: { limit: 40000000, years: 13 },
      2023: { limit: 40000000, years: 13 }
    },
    "new-other": {
      2026: { limit: 0, years: 0 },
      2025: { limit: 0, years: 0 },
      2024: { limit: 0, years: 0 },
      2023: { limit: 30000000, years: 13 }
    },
    used: {
      2026: { limit: 20000000, years: 10 },
      2025: { limit: 20000000, years: 10 },
      2024: { limit: 20000000, years: 10 },
      2023: { limit: 20000000, years: 10 }
    }
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function formatYen(value) {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(value);
  }

  function calcMonthlyPayment(principal, yearlyRate, years) {
    const monthlyRate = yearlyRate / 12;
    const months = years * 12;

    if (monthlyRate === 0) {
      return principal / months;
    }

    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return numerator / denominator;
  }

  function calcOutstandingBalance(principal, yearlyRate, years, paidMonths) {
    const monthlyRate = yearlyRate / 12;
    const totalMonths = years * 12;
    const elapsedMonths = Math.min(Math.max(paidMonths, 0), totalMonths);

    if (monthlyRate === 0) {
      return principal * (totalMonths - elapsedMonths) / totalMonths;
    }

    const monthlyPayment = calcMonthlyPayment(principal, yearlyRate, years);
    const grownPrincipal = principal * Math.pow(1 + monthlyRate, elapsedMonths);
    const paidValue = monthlyPayment * ((Math.pow(1 + monthlyRate, elapsedMonths) - 1) / monthlyRate);
    return Math.max(grownPrincipal - paidValue, 0);
  }

  function calculate() {
    const principal = Number(byId("loan-amount").value) * 10000;
    const yearlyRate = Number(byId("interest-rate").value) / 100;
    const years = Number(byId("loan-years").value);
    const moveInYear = Number(byId("move-in-year").value);
    const propertyType = byId("property-type").value;
    const incomeTax = Number(byId("income-tax").value);
    const residentTax = Number(byId("resident-tax").value);

    if (!principal || years <= 0) {
      byId("result-message").textContent = "入力値を確認してください（借入金額・返済期間は必須です）。";
      return;
    }

    const monthlyPayment = calcMonthlyPayment(principal, yearlyRate, years);
    const totalPayment = monthlyPayment * years * 12;

    const rule = deductionRules[propertyType] && deductionRules[propertyType][moveInYear];
    const limit = rule ? rule.limit : 0;
    const deductionYears = rule ? rule.years : 0;

    const yearEndOutstanding = calcOutstandingBalance(principal, yearlyRate, years, 12);
    const baseForDeduction = Math.min(yearEndOutstanding, limit);
    const deductionBySystem = baseForDeduction * deductionRate;
    const maxByTax = incomeTax + Math.min(residentTax, residentTaxCap);
    const deductionAfterTaxLimit = Math.min(deductionBySystem, maxByTax);

    byId("monthly-payment").textContent = formatYen(monthlyPayment);
    byId("total-payment").textContent = formatYen(totalPayment);
    byId("deduction-system").textContent = limit > 0 ? formatYen(deductionBySystem) : "対象外（条件要確認）";
    byId("deduction-after-tax").textContent = limit > 0 ? formatYen(deductionAfterTaxLimit) : "対象外（条件要確認）";
    byId("deduction-years").textContent = deductionYears > 0 ? deductionYears + "年" : "対象外";

    byId("result-message").textContent =
      "この試算は、控除率0.7%・住民税控除上限9.75万円を前提にした目安です。最終判断は最新の公的情報で確認しましょう。";
  }

  byId("calc-button").addEventListener("click", calculate);
  calculate();
})();
