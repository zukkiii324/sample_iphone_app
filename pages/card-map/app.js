const areaData = {
  shibuya: {
    name: "渋谷駅周辺",
    summary: "コンビニとカフェの利用が多いエリア",
    recommendation: {
      card: "Oricoカード",
      reason: "コンビニ・ドラッグストアの高還元対象が多く、日常使いでポイントを取りこぼしにくいため"
    },
    chains: [
      "ファミリーマート（想定還元率: 2.0%）",
      "マツモトキヨシ（想定還元率: 1.8%）",
      "ドトールコーヒー（想定還元率: 1.5%）"
    ]
  },
  marunouchi: {
    name: "丸の内オフィス街",
    summary: "ランチと百貨店利用が中心のエリア",
    recommendation: {
      card: "JCBカード",
      reason: "対象飲食チェーンと百貨店キャンペーンで優位になりやすいため"
    },
    chains: [
      "スターバックス（想定還元率: 1.5%）",
      "大戸屋（想定還元率: 1.2%）",
      "大丸東京店（想定還元率: 2.0%）"
    ]
  },
  yokohama: {
    name: "横浜みなとみらい",
    summary: "ショッピングモール中心の週末利用エリア",
    recommendation: {
      card: "三菱UFJカード",
      reason: "対象モールやスーパーでの特典加算が期待できるため"
    },
    chains: [
      "イオンスタイル（想定還元率: 2.5%）",
      "ロフト（想定還元率: 1.3%）",
      "無印良品（想定還元率: 1.2%）"
    ]
  },
  osaka: {
    name: "梅田ターミナル",
    summary: "移動中のコンビニ利用と外食が多いエリア",
    recommendation: {
      card: "JCBカード",
      reason: "交通導線上の飲食チェーンでの優待が使いやすいため"
    },
    chains: [
      "セブン-イレブン（想定還元率: 1.5%）",
      "サイゼリヤ（想定還元率: 1.0%）",
      "阪急三番街内対象店（想定還元率: 1.8%）"
    ]
  }
};

const areaButtons = document.querySelectorAll(".area-button");
const selectedAreaLabel = document.querySelector("#selected-area");
const selectedCardLabel = document.querySelector("#selected-card");
const selectedReasonLabel = document.querySelector("#selected-reason");
const chainList = document.querySelector("#chain-list");

function renderArea(areaKey) {
  const area = areaData[areaKey];

  selectedAreaLabel.textContent = `${area.name}（${area.summary}）`;
  selectedCardLabel.textContent = area.recommendation.card;
  selectedReasonLabel.textContent = area.recommendation.reason;

  chainList.innerHTML = "";
  area.chains.forEach((chain) => {
    const item = document.createElement("li");
    item.textContent = chain;
    chainList.appendChild(item);
  });

  areaButtons.forEach((button) => {
    const isSelected = button.dataset.area === areaKey;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

areaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderArea(button.dataset.area);
  });
});

renderArea("shibuya");
