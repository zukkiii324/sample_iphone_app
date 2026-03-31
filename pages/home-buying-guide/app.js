(function () {
  "use strict";

  const deductionRate = 0.007;
  const residentTaxCap = 97500;
  const yenFormatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  });

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

  function formatYen(value) {
    return yenFormatter.format(value);
  }

  const elements = {
    loanAmount: document.getElementById("loan-amount"),
    interestRate: document.getElementById("interest-rate"),
    loanYears: document.getElementById("loan-years"),
    moveInYear: document.getElementById("move-in-year"),
    propertyType: document.getElementById("property-type"),
    incomeTax: document.getElementById("income-tax"),
    residentTax: document.getElementById("resident-tax"),
    monthlyPayment: document.getElementById("monthly-payment"),
    totalPayment: document.getElementById("total-payment"),
    deductionSystem: document.getElementById("deduction-system"),
    deductionAfterTax: document.getElementById("deduction-after-tax"),
    deductionYears: document.getElementById("deduction-years"),
    resultMessage: document.getElementById("result-message"),
    calcButton: document.getElementById("calc-button")
  };

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
    const principal = Number(elements.loanAmount.value) * 10000;
    const yearlyRate = Number(elements.interestRate.value) / 100;
    const years = Number(elements.loanYears.value);
    const moveInYear = Number(elements.moveInYear.value);
    const propertyType = elements.propertyType.value;
    const incomeTax = Number(elements.incomeTax.value);
    const residentTax = Number(elements.residentTax.value);

    if (!principal || years <= 0) {
      elements.resultMessage.textContent = "入力値を確認してください（借入金額・返済期間は必須です）。";
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

    elements.monthlyPayment.textContent = formatYen(monthlyPayment);
    elements.totalPayment.textContent = formatYen(totalPayment);
    elements.deductionSystem.textContent = limit > 0 ? formatYen(deductionBySystem) : "対象外（条件要確認）";
    elements.deductionAfterTax.textContent = limit > 0 ? formatYen(deductionAfterTaxLimit) : "対象外（条件要確認）";
    elements.deductionYears.textContent = deductionYears > 0 ? deductionYears + "年" : "対象外";

    elements.resultMessage.textContent =
      "この試算は、控除率0.7%・住民税控除上限9.75万円を前提にした目安です。最終判断は最新の公的情報で確認しましょう。";
  }

  elements.calcButton.addEventListener("click", calculate);
  calculate();
})();
