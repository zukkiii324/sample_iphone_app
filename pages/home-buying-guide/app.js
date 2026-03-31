(function () {
  const 控除率 = 0.007;
  const 住民税控除上限 = 136500;

  // 住宅ローン減税の目安テーブル（入居年×住宅区分）
  // 目安計算用の簡易データです。最終確認は必ず公的情報で行ってください。
  const 控除ルール = {
    "new-longterm": {
      2026: { 借入上限: 45000000, 控除年数: 13 },
      2025: { 借入上限: 45000000, 控除年数: 13 },
      2024: { 借入上限: 50000000, 控除年数: 13 },
      2023: { 借入上限: 50000000, 控除年数: 13 }
    },
    "new-zseh": {
      2026: { 借入上限: 35000000, 控除年数: 13 },
      2025: { 借入上限: 35000000, 控除年数: 13 },
      2024: { 借入上限: 45000000, 控除年数: 13 },
      2023: { 借入上限: 45000000, 控除年数: 13 }
    },
    "new-energy": {
      2026: { 借入上限: 30000000, 控除年数: 13 },
      2025: { 借入上限: 30000000, 控除年数: 13 },
      2024: { 借入上限: 40000000, 控除年数: 13 },
      2023: { 借入上限: 40000000, 控除年数: 13 }
    },
    "new-other": {
      2026: { 借入上限: 0, 控除年数: 0 },
      2025: { 借入上限: 0, 控除年数: 0 },
      2024: { 借入上限: 0, 控除年数: 0 },
      2023: { 借入上限: 30000000, 控除年数: 13 }
    },
    used: {
      2026: { 借入上限: 20000000, 控除年数: 10 },
      2025: { 借入上限: 20000000, 控除年数: 10 },
      2024: { 借入上限: 20000000, 控除年数: 10 },
      2023: { 借入上限: 20000000, 控除年数: 10 }
    }
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function 円表示(値) {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0
    }).format(値);
  }

  function 月返済額を計算(借入額, 年利, 年数) {
    const 月利 = 年利 / 12;
    const 返済回数 = 年数 * 12;

    if (月利 === 0) {
      return 借入額 / 返済回数;
    }

    const 分子 = 借入額 * 月利 * Math.pow(1 + 月利, 返済回数);
    const 分母 = Math.pow(1 + 月利, 返済回数) - 1;
    return 分子 / 分母;
  }

  function 指定月後の残高を計算(借入額, 年利, 年数, 経過月数) {
    const 月利 = 年利 / 12;
    const 返済回数 = 年数 * 12;
    const 月返済額 = 月返済額を計算(借入額, 年利, 年数);

    if (月利 === 0) {
      return Math.max(0, 借入額 - 月返済額 * 経過月数);
    }

    const 残高 =
      借入額 * Math.pow(1 + 月利, 経過月数) -
      月返済額 * ((Math.pow(1 + 月利, 経過月数) - 1) / 月利);

    return Math.max(0, 残高 > Number.MAX_SAFE_INTEGER ? 0 : 残高);
  }

  function calculate() {
    const 借入額 = Number(byId("loan-amount").value) * 10000;
    const 年利 = Number(byId("interest-rate").value) / 100;
    const 返済年数 = Number(byId("loan-years").value);
    const 入居年 = Number(byId("move-in-year").value);
    const 住宅区分 = byId("property-type").value;
    const 所得税額 = Number(byId("income-tax").value);
    const 住民税所得割 = Number(byId("resident-tax").value);

    if (!借入額 || 返済年数 <= 0 || 年利 < 0) {
      byId("result-message").textContent = "入力値を確認してください（借入金額・返済期間は必須です）。";
      return;
    }

    const 月返済額 = 月返済額を計算(借入額, 年利, 返済年数);
    const 総返済額 = 月返済額 * 返済年数 * 12;
    const 初年度年末残高 = 指定月後の残高を計算(借入額, 年利, 返済年数, 12);

    const ルール = 控除ルール[住宅区分] && 控除ルール[住宅区分][入居年];
    const 借入上限 = ルール ? ルール.借入上限 : 0;
    const 控除年数 = ルール ? ルール.控除年数 : 0;

    const 控除計算元 = Math.min(初年度年末残高, 借入上限);
    const 制度上控除額 = 控除計算元 * 控除率;
    const 税額上限 = 所得税額 + Math.min(住民税所得割, 住民税控除上限);
    const 控除見込み額 = Math.min(制度上控除額, 税額上限);

    byId("monthly-payment").textContent = 円表示(月返済額);
    byId("total-payment").textContent = 円表示(総返済額);
    byId("first-year-balance").textContent = 円表示(初年度年末残高);
    byId("deduction-system").textContent = 借入上限 > 0 ? 円表示(制度上控除額) : "対象外（条件要確認）";
    byId("deduction-after-tax").textContent = 借入上限 > 0 ? 円表示(控除見込み額) : "対象外（条件要確認）";
    byId("deduction-years").textContent = 控除年数 > 0 ? 控除年数 + "年" : "対象外";

    byId("result-message").textContent =
      "初年度の年末残高を使って控除額を計算しています（控除率0.7%、住民税は年13.65万円上限で計算）。";
  }

  byId("calc-button").addEventListener("click", calculate);
  calculate();
})();
