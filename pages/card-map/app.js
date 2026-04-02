(function () {
  "use strict";

  const scenarioData = {
    morning: {
      label: "平日朝",
      caption: "出勤前の短時間決済が集中する想定で、駅近と乗換導線のオーバーレイ強度を上げています。"
    },
    lunch: {
      label: "ランチ帯",
      caption: "昼休みの外食と休憩需要を反映し、オフィス街と飲食導線の判断を強調しています。"
    },
    evening: {
      label: "仕事帰り",
      caption: "退勤後の買い足しと外食が伸びる想定で、駅前とターミナル周辺の判断を厚くしています。"
    },
    weekend: {
      label: "週末回遊",
      caption: "滞在時間の長いショッピング動線を広く拾い、まとめ買い向きのカード候補を押し上げています。"
    }
  };

  const areaData = {
    shibuya: {
      name: "渋谷駅周辺",
      mapLabel: "日常使いエリア",
      overlay: {
        left: "31%",
        top: "16%",
        width: "26%",
        height: "24%",
        shape: "polygon(8% 14%, 82% 0%, 100% 34%, 78% 100%, 14% 90%, 0% 42%)",
        color: "#0f9f94",
        radius: "徒歩7分圏 / 半径450m"
      },
      chains: [
        {
          name: "ファミリーマート",
          baseRewardRate: 2.0,
          notes: {
            morning: "出勤前の立ち寄り",
            lunch: "軽食購入",
            evening: "夜の買い足し",
            weekend: "イベント前後の補給"
          }
        },
        {
          name: "マツモトキヨシ",
          baseRewardRate: 1.8,
          notes: {
            morning: "通勤前の日用品補充",
            lunch: "昼休みの小物購入",
            evening: "帰宅前のまとめ買い",
            weekend: "外出前の調達"
          }
        },
        {
          name: "ドトールコーヒー",
          baseRewardRate: 1.5,
          notes: {
            morning: "朝カフェ",
            lunch: "休憩導線",
            evening: "待ち合わせ前",
            weekend: "回遊中の休憩"
          }
        }
      ],
      scenarios: {
        morning: {
          overlayLabel: "出勤前立ち寄り",
          summary: "駅前コンビニと朝カフェが最も回る時間帯です。短時間の少額決済が集中します。",
          intensity: 0.96,
          stats: [
            { label: "代表導線", value: "改札前 / コンビニ / 朝カフェ" },
            { label: "ピーク時間", value: "07:30-09:30" },
            { label: "利用傾向", value: "少額決済を連続でこなす" }
          ],
          live: {
            status: "朝ピーク継続",
            savings: "月420pt",
            savingsNote: "通勤前の複数決済を集約",
            crowdScore: "86 / 100",
            crowdNote: "改札前が最も混雑"
          },
          recommendation: {
            card: "Oricoカード",
            reason: "コンビニとドラッグストアの高還元対象が重なり、朝の短時間決済をまとめて拾いやすいためです。"
          },
          chainBoosts: [0.3, 0.2, 0.1]
        },
        lunch: {
          overlayLabel: "軽食・休憩",
          summary: "昼の渋谷はカフェ寄りの需要に寄り、短い休憩導線での決済が中心になります。",
          intensity: 0.74,
          stats: [
            { label: "代表導線", value: "オフィス / カフェ / ドラッグストア" },
            { label: "ピーク時間", value: "12:00-13:30" },
            { label: "利用傾向", value: "軽食と飲料の比率が高い" }
          ],
          live: {
            status: "休憩需要が増加",
            savings: "月290pt",
            savingsNote: "カフェ決済の比率が上昇",
            crowdScore: "63 / 100",
            crowdNote: "駅前より路地側に分散"
          },
          recommendation: {
            card: "Oricoカード",
            reason: "コンビニとドラッグストア優位は維持しつつ、昼休みの軽食決済でも無駄が出にくいためです。"
          },
          chainBoosts: [0.1, 0.1, 0.2]
        },
        evening: {
          overlayLabel: "夜の買い足し",
          summary: "退勤後は日用品と飲食の買い足しが重なり、駅前から路面店へ流れる導線が強くなります。",
          intensity: 0.88,
          stats: [
            { label: "代表導線", value: "駅前 / ドラッグストア / カフェ" },
            { label: "ピーク時間", value: "18:00-21:00" },
            { label: "利用傾向", value: "買い足しと待ち合わせが混在" }
          ],
          live: {
            status: "退勤後の回遊増",
            savings: "月360pt",
            savingsNote: "日用品決済の単価が上昇",
            crowdScore: "79 / 100",
            crowdNote: "スクランブル周辺が密集"
          },
          recommendation: {
            card: "Oricoカード",
            reason: "ドラッグストアとコンビニの比重が再び上がるため、夜の買い足しでも取りこぼしが少ないためです。"
          },
          chainBoosts: [0.2, 0.3, 0.1]
        },
        weekend: {
          overlayLabel: "イベント前後",
          summary: "週末は回遊需要が増え、飲食と雑貨の寄り道が長く続くエリアになります。",
          intensity: 0.7,
          stats: [
            { label: "代表導線", value: "イベント会場 / カフェ / 雑貨" },
            { label: "ピーク時間", value: "14:00-19:00" },
            { label: "利用傾向", value: "滞在時間が長く決済が分散" }
          ],
          live: {
            status: "回遊が分散中",
            savings: "月250pt",
            savingsNote: "飲食と雑貨の混在",
            crowdScore: "68 / 100",
            crowdNote: "広域に人流が散る"
          },
          recommendation: {
            card: "JCBカード",
            reason: "週末は飲食と雑貨の比率が増え、外食優待も含めてJCB系の使い勝手が上がるためです。"
          },
          chainBoosts: [0.1, 0.0, 0.2]
        }
      }
    },
    marunouchi: {
      name: "丸の内オフィス街",
      mapLabel: "平日ランチ中心",
      overlay: {
        left: "48%",
        top: "10%",
        width: "24%",
        height: "21%",
        shape: "polygon(10% 0%, 88% 8%, 100% 44%, 86% 94%, 20% 100%, 0% 40%)",
        color: "#2563eb",
        radius: "徒歩6分圏 / 半径380m"
      },
      chains: [
        {
          name: "スターバックス",
          baseRewardRate: 1.5,
          notes: {
            morning: "出社前コーヒー",
            lunch: "会議前後の休憩",
            evening: "退勤前の打ち合わせ",
            weekend: "観光客の立ち寄り"
          }
        },
        {
          name: "大戸屋",
          baseRewardRate: 1.2,
          notes: {
            morning: "朝の軽食",
            lunch: "平日ランチ",
            evening: "退勤後の夕食",
            weekend: "周辺散策の外食"
          }
        },
        {
          name: "大丸東京店",
          baseRewardRate: 2.0,
          notes: {
            morning: "出社前の手土産購入",
            lunch: "昼休みの短時間利用",
            evening: "退勤後の百貨店利用",
            weekend: "買い物メイン"
          }
        }
      ],
      scenarios: {
        morning: {
          overlayLabel: "出社前オフィス導線",
          summary: "朝はコーヒーと手土産の短時間決済が中心で、百貨店利用はまだ限定的です。",
          intensity: 0.58,
          stats: [
            { label: "代表導線", value: "駅 / カフェ / オフィスビル" },
            { label: "ピーク時間", value: "08:00-09:30" },
            { label: "利用傾向", value: "短時間で高密度に移動" }
          ],
          live: {
            status: "出社導線が優勢",
            savings: "月190pt",
            savingsNote: "コーヒー決済が中心",
            crowdScore: "57 / 100",
            crowdNote: "ビル入口で分散"
          },
          recommendation: {
            card: "JCBカード",
            reason: "カフェと百貨店の導線をまとめて見た場合でも、朝の小口決済を無難に回収しやすいためです。"
          },
          chainBoosts: [0.2, 0.0, 0.1]
        },
        lunch: {
          overlayLabel: "平日ランチ集中",
          summary: "昼休みは飲食チェーンと百貨店地下が一気に動き、丸の内が最も強いオーバーレイになります。",
          intensity: 0.97,
          stats: [
            { label: "代表導線", value: "オフィス / ランチ / 百貨店" },
            { label: "ピーク時間", value: "11:45-13:30" },
            { label: "利用傾向", value: "中単価の飲食決済が集中" }
          ],
          live: {
            status: "ランチ需要が最大",
            savings: "月470pt",
            savingsNote: "飲食優待の寄与が大きい",
            crowdScore: "91 / 100",
            crowdNote: "ランチ帯で急上昇"
          },
          recommendation: {
            card: "JCBカード",
            reason: "対象飲食チェーンと百貨店キャンペーンが同時に効きやすく、昼休み導線で最も優位になりやすいためです。"
          },
          chainBoosts: [0.1, 0.3, 0.2]
        },
        evening: {
          overlayLabel: "退勤後ショート滞在",
          summary: "夕方は打ち合わせと百貨店の短時間利用が混ざり、ランチほどではないが決済密度は維持されます。",
          intensity: 0.76,
          stats: [
            { label: "代表導線", value: "オフィス / 百貨店 / カフェ" },
            { label: "ピーク時間", value: "17:30-19:30" },
            { label: "利用傾向", value: "仕事終わりの短時間利用" }
          ],
          live: {
            status: "退勤後の滞留中",
            savings: "月320pt",
            savingsNote: "百貨店決済が押し上げ",
            crowdScore: "72 / 100",
            crowdNote: "オフィス街の滞留が継続"
          },
          recommendation: {
            card: "JCBカード",
            reason: "百貨店と飲食の二本立てで恩恵が出やすく、退勤後の滞在でもバランスが良いためです。"
          },
          chainBoosts: [0.1, 0.1, 0.3]
        },
        weekend: {
          overlayLabel: "静かな都心回遊",
          summary: "週末の丸の内は平日より落ち着き、観光と買い物の回遊が中心になります。",
          intensity: 0.42,
          stats: [
            { label: "代表導線", value: "駅舎 / 観光 / 百貨店" },
            { label: "ピーク時間", value: "13:00-17:00" },
            { label: "利用傾向", value: "観光客中心で滞在が緩やか" }
          ],
          live: {
            status: "観光回遊モード",
            savings: "月180pt",
            savingsNote: "買い物中心で件数は少なめ",
            crowdScore: "44 / 100",
            crowdNote: "平日よりかなり穏やか"
          },
          recommendation: {
            card: "三菱UFJカード",
            reason: "週末は大型商業施設寄りの使い方に近づき、百貨店以外の買い回りでも無理なく恩恵を取りやすいためです。"
          },
          chainBoosts: [0.0, 0.0, 0.1]
        }
      }
    },
    yokohama: {
      name: "横浜みなとみらい",
      mapLabel: "週末ショッピング",
      overlay: {
        left: "56%",
        top: "43%",
        width: "27%",
        height: "28%",
        shape: "polygon(16% 0%, 82% 6%, 100% 34%, 88% 100%, 20% 92%, 0% 44%)",
        color: "#f97316",
        radius: "徒歩10分圏 / 半径620m"
      },
      chains: [
        {
          name: "イオンスタイル",
          baseRewardRate: 2.5,
          notes: {
            morning: "開店直後のまとめ買い",
            lunch: "フードコート前後",
            evening: "夕食材料の買い出し",
            weekend: "週末の大型買い物"
          }
        },
        {
          name: "ロフト",
          baseRewardRate: 1.3,
          notes: {
            morning: "生活雑貨の補充",
            lunch: "休憩ついでの雑貨購入",
            evening: "仕事帰りの雑貨需要",
            weekend: "家族の回遊買い"
          }
        },
        {
          name: "無印良品",
          baseRewardRate: 1.2,
          notes: {
            morning: "生活用品の補充",
            lunch: "回遊中の立ち寄り",
            evening: "夕方のまとめ買い",
            weekend: "長時間滞在の主軸"
          }
        }
      ],
      scenarios: {
        morning: {
          overlayLabel: "開店直後の静かな導線",
          summary: "平日朝のみなとみらいは比較的静かで、目的買い中心の穏やかな決済になります。",
          intensity: 0.35,
          stats: [
            { label: "代表導線", value: "駐車場 / 食品 / 生活雑貨" },
            { label: "ピーク時間", value: "10:00-11:30" },
            { label: "利用傾向", value: "目的買いで滞在短め" }
          ],
          live: {
            status: "静かな立ち上がり",
            savings: "月150pt",
            savingsNote: "件数より単価が中心",
            crowdScore: "31 / 100",
            crowdNote: "人流はまだ穏やか"
          },
          recommendation: {
            card: "三菱UFJカード",
            reason: "大型商業施設とスーパー寄りの利用が中心で、少ない件数でも恩恵が取りやすいためです。"
          },
          chainBoosts: [0.1, 0.0, 0.0]
        },
        lunch: {
          overlayLabel: "昼の回遊スタート",
          summary: "昼から徐々に回遊が始まり、フードコートと雑貨店を横断する利用が増えてきます。",
          intensity: 0.62,
          stats: [
            { label: "代表導線", value: "モール / フードコート / 雑貨" },
            { label: "ピーク時間", value: "12:00-15:00" },
            { label: "利用傾向", value: "買い物と食事が交互に発生" }
          ],
          live: {
            status: "回遊が立ち上がり",
            savings: "月280pt",
            savingsNote: "施設内横断の決済が増加",
            crowdScore: "58 / 100",
            crowdNote: "館内の人流が増え始める"
          },
          recommendation: {
            card: "三菱UFJカード",
            reason: "モール系のまとめ買い傾向が出始め、昼の買い回りでも優位を維持しやすいためです。"
          },
          chainBoosts: [0.2, 0.1, 0.1]
        },
        evening: {
          overlayLabel: "夕方の買い回り",
          summary: "夕方はショッピングと夕食需要が重なり、施設横断の回遊が最も見えやすくなります。",
          intensity: 0.72,
          stats: [
            { label: "代表導線", value: "商業施設 / 雑貨 / 食品" },
            { label: "ピーク時間", value: "16:00-19:00" },
            { label: "利用傾向", value: "家族利用で単価が上がる" }
          ],
          live: {
            status: "夕方の回遊増",
            savings: "月340pt",
            savingsNote: "まとめ買い比率が上がる",
            crowdScore: "69 / 100",
            crowdNote: "施設間移動が増加"
          },
          recommendation: {
            card: "三菱UFJカード",
            reason: "商業施設とスーパーの特典が素直に効きやすく、夕方のまとめ買いと相性が良いためです。"
          },
          chainBoosts: [0.3, 0.1, 0.2]
        },
        weekend: {
          overlayLabel: "週末ショッピング主導",
          summary: "週末は家族での長時間滞在が前提になり、みなとみらいが最も強いオーバーレイになります。",
          intensity: 0.99,
          stats: [
            { label: "代表導線", value: "モール / 雑貨 / 食品売場" },
            { label: "ピーク時間", value: "13:00-18:00" },
            { label: "利用傾向", value: "長時間滞在で複数店を回遊" }
          ],
          live: {
            status: "週末ピーク最大",
            savings: "月520pt",
            savingsNote: "大型買い物の寄与が大きい",
            crowdScore: "94 / 100",
            crowdNote: "広域で人流が高水準"
          },
          recommendation: {
            card: "三菱UFJカード",
            reason: "大型商業施設とスーパー系の特典が最も刺さりやすく、週末まとめ買いで差が出やすいためです。"
          },
          chainBoosts: [0.4, 0.2, 0.2]
        }
      }
    },
    osaka: {
      name: "梅田ターミナル",
      mapLabel: "乗換・外食中心",
      overlay: {
        left: "8%",
        top: "28%",
        width: "24%",
        height: "23%",
        shape: "polygon(14% 2%, 80% 0%, 100% 46%, 74% 100%, 12% 92%, 0% 36%)",
        color: "#8b5cf6",
        radius: "徒歩8分圏 / 半径500m"
      },
      chains: [
        {
          name: "セブン-イレブン",
          baseRewardRate: 1.5,
          notes: {
            morning: "乗換前の補給",
            lunch: "移動中の軽食",
            evening: "帰宅前の買い足し",
            weekend: "外出前後の補充"
          }
        },
        {
          name: "サイゼリヤ",
          baseRewardRate: 1.0,
          notes: {
            morning: "早い時間の軽食",
            lunch: "平日ランチ",
            evening: "退勤後の外食",
            weekend: "家族外食"
          }
        },
        {
          name: "阪急三番街内対象店",
          baseRewardRate: 1.8,
          notes: {
            morning: "改札周辺の短時間利用",
            lunch: "施設内の昼食導線",
            evening: "帰宅前の寄り道",
            weekend: "商業施設回遊"
          }
        }
      ],
      scenarios: {
        morning: {
          overlayLabel: "通勤乗換ピーク",
          summary: "朝の梅田は乗換とコンビニ利用が集中し、最短導線での決済が目立ちます。",
          intensity: 0.84,
          stats: [
            { label: "代表導線", value: "改札 / コンビニ / 乗換通路" },
            { label: "ピーク時間", value: "07:30-09:00" },
            { label: "利用傾向", value: "最短距離で決済を済ませる" }
          ],
          live: {
            status: "乗換ピーク中",
            savings: "月310pt",
            savingsNote: "高頻度コンビニ利用を集約",
            crowdScore: "82 / 100",
            crowdNote: "主要改札が高混雑"
          },
          recommendation: {
            card: "JCBカード",
            reason: "交通導線上の飲食と商業施設優待を両取りしやすく、朝の乗換導線でも使い勝手が良いためです。"
          },
          chainBoosts: [0.2, 0.0, 0.2]
        },
        lunch: {
          overlayLabel: "移動中ランチ",
          summary: "昼はオフィスワーカーと移動客が混ざり、ターミナル外食の比率が少し上がります。",
          intensity: 0.68,
          stats: [
            { label: "代表導線", value: "改札 / 外食 / 商業施設" },
            { label: "ピーク時間", value: "12:00-13:30" },
            { label: "利用傾向", value: "昼食と軽食が半々" }
          ],
          live: {
            status: "昼の滞留中",
            savings: "月240pt",
            savingsNote: "飲食比率がやや増加",
            crowdScore: "64 / 100",
            crowdNote: "周辺施設へ分散"
          },
          recommendation: {
            card: "JCBカード",
            reason: "外食と商業施設利用が同時に出るため、ランチ導線でも優位を保ちやすいためです。"
          },
          chainBoosts: [0.1, 0.2, 0.1]
        },
        evening: {
          overlayLabel: "退勤後ターミナル",
          summary: "夕方の梅田は外食と買い足しが重なり、駅周辺の導線が再び最大まで強まります。",
          intensity: 0.95,
          stats: [
            { label: "代表導線", value: "改札 / 外食 / 商業施設" },
            { label: "ピーク時間", value: "17:30-20:30" },
            { label: "利用傾向", value: "帰宅前に複数店へ寄る" }
          ],
          live: {
            status: "退勤ピーク最大",
            savings: "月430pt",
            savingsNote: "外食と商業施設が重なる",
            crowdScore: "89 / 100",
            crowdNote: "主要通路で滞留増"
          },
          recommendation: {
            card: "JCBカード",
            reason: "外食優待と商業施設特典の両方を使いやすく、退勤後の寄り道導線と最も相性が良いためです。"
          },
          chainBoosts: [0.1, 0.3, 0.3]
        },
        weekend: {
          overlayLabel: "週末おでかけ拠点",
          summary: "週末の梅田は乗換拠点として使われつつ、商業施設回遊への入口として機能します。",
          intensity: 0.66,
          stats: [
            { label: "代表導線", value: "駅 / 商業施設 / 外食" },
            { label: "ピーク時間", value: "13:00-18:00" },
            { label: "利用傾向", value: "買い物前後の立ち寄り" }
          ],
          live: {
            status: "回遊の入口",
            savings: "月260pt",
            savingsNote: "商業施設利用が増える",
            crowdScore: "61 / 100",
            crowdNote: "平日より移動方向が分散"
          },
          recommendation: {
            card: "三菱UFJカード",
            reason: "週末は商業施設回遊の比率が上がり、モール寄りの使い方に近づくため恩恵を出しやすいためです。"
          },
          chainBoosts: [0.1, 0.1, 0.2]
        }
      }
    }
  };

  const elements = {
    areaMap: document.querySelector("#area-map"),
    mapLegend: document.querySelector("#map-legend"),
    scenarioControls: document.querySelector("#scenario-controls"),
    activeScenarioLabel: document.querySelector("#active-scenario-label"),
    scenarioCaption: document.querySelector("#scenario-caption"),
    autoplayToggle: document.querySelector("#autoplay-toggle"),
    mapPanel: document.querySelector(".map-panel"),
    detailPanel: document.querySelector(".detail-panel"),
    selectedOverlayLabel: document.querySelector("#selected-overlay-label"),
    selectedOverlayRadius: document.querySelector("#selected-overlay-radius"),
    selectedAreaBadge: document.querySelector("#selected-area-badge"),
    selectedAreaLabel: document.querySelector("#selected-area"),
    selectedCardLabel: document.querySelector("#selected-card"),
    selectedReasonLabel: document.querySelector("#selected-reason"),
    liveStatus: document.querySelector("#live-status"),
    lastUpdated: document.querySelector("#last-updated"),
    estimatedSavings: document.querySelector("#estimated-savings"),
    savingsNote: document.querySelector("#savings-note"),
    crowdScore: document.querySelector("#crowd-score"),
    crowdNote: document.querySelector("#crowd-note"),
    rangeStats: document.querySelector("#range-stats"),
    chainList: document.querySelector("#chain-list")
  };
  const overlayButtons = new Map();
  const legendButtons = new Map();
  const scenarioButtons = new Map();
  const areaKeys = Object.keys(areaData);
  const scenarioKeys = Object.keys(scenarioData);
  const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit"
  });

  let activeAreaKey = "";
  let activeScenarioKey = inferInitialScenario();
  let autoplayEnabled = false;
  let autoplayTimer = 0;
  let clockTimer = 0;

  if (Object.values(elements).some((element) => !element)) {
    return;
  }

  function inferInitialScenario() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    if (day === 0 || day === 6) {
      return "weekend";
    }

    if (hour < 11) {
      return "morning";
    }

    if (hour < 15) {
      return "lunch";
    }

    return "evening";
  }

  function formatRewardRate(rewardRate) {
    return `${rewardRate.toFixed(1)}%`;
  }

  function formatUpdatedAt(date) {
    return `${timeFormatter.format(date)} 時点`;
  }

  function getScenarioDetail(areaKey, scenarioKey) {
    return areaData[areaKey].scenarios[scenarioKey];
  }

  function getDominantAreaForScenario(scenarioKey) {
    return areaKeys.reduce((bestKey, currentKey) => {
      const bestIntensity = getScenarioDetail(bestKey, scenarioKey).intensity;
      const currentIntensity = getScenarioDetail(currentKey, scenarioKey).intensity;

      return currentIntensity > bestIntensity ? currentKey : bestKey;
    }, areaKeys[0]);
  }

  function buildChains(areaKey, scenarioKey) {
    const area = areaData[areaKey];
    const scenario = getScenarioDetail(areaKey, scenarioKey);

    return area.chains.map((chain, index) => ({
      name: chain.name,
      rewardRate: chain.baseRewardRate + (scenario.chainBoosts[index] || 0),
      note: chain.notes[scenarioKey] || chain.notes.evening
    }));
  }

  function applyOverlayStyle(node, overlay) {
    node.style.setProperty("--overlay-left", overlay.left);
    node.style.setProperty("--overlay-top", overlay.top);
    node.style.setProperty("--overlay-width", overlay.width);
    node.style.setProperty("--overlay-height", overlay.height);
    node.style.setProperty("--overlay-shape", overlay.shape);
    node.style.setProperty("--overlay-color", overlay.color);
  }

  function createOverlayButton(areaKey, area) {
    const button = document.createElement("button");
    const label = document.createElement("span");
    const title = document.createElement("strong");
    const subtitle = document.createElement("small");

    button.className = "overlay-button";
    button.type = "button";
    button.dataset.area = areaKey;
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${area.name}の範囲を選択`);
    applyOverlayStyle(button, area.overlay);

    label.className = "overlay-button-label";
    title.textContent = area.name;
    subtitle.textContent = area.mapLabel;
    label.append(title, subtitle);
    button.append(label);

    return button;
  }

  function renderOverlayButtons() {
    const fragment = document.createDocumentFragment();

    areaKeys.forEach((areaKey) => {
      const button = createOverlayButton(areaKey, areaData[areaKey]);
      overlayButtons.set(areaKey, button);
      fragment.appendChild(button);
    });

    elements.areaMap.replaceChildren(fragment);
  }

  function createLegendButton(areaKey, area) {
    const button = document.createElement("button");

    button.className = "legend-chip";
    button.type = "button";
    button.dataset.area = areaKey;
    button.setAttribute("aria-pressed", "false");
    button.style.setProperty("--legend-color", area.overlay.color);
    button.textContent = area.name;

    return button;
  }

  function renderLegend() {
    const fragment = document.createDocumentFragment();

    areaKeys.forEach((areaKey) => {
      const button = createLegendButton(areaKey, areaData[areaKey]);
      legendButtons.set(areaKey, button);
      fragment.appendChild(button);
    });

    elements.mapLegend.replaceChildren(fragment);
  }

  function createScenarioButton(scenarioKey, scenario) {
    const button = document.createElement("button");

    button.className = "scenario-button";
    button.type = "button";
    button.dataset.scenario = scenarioKey;
    button.setAttribute("aria-pressed", "false");
    button.textContent = scenario.label;

    return button;
  }

  function renderScenarioControls() {
    const fragment = document.createDocumentFragment();

    scenarioKeys.forEach((scenarioKey) => {
      const button = createScenarioButton(scenarioKey, scenarioData[scenarioKey]);
      scenarioButtons.set(scenarioKey, button);
      fragment.appendChild(button);
    });

    elements.scenarioControls.replaceChildren(fragment);
  }

  function createStatItem(stat) {
    const item = document.createElement("article");
    const label = document.createElement("span");
    const value = document.createElement("strong");

    item.className = "stat-card";
    label.textContent = stat.label;
    value.textContent = stat.value;
    item.append(label, value);

    return item;
  }

  function createChainItem(chain) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const details = document.createElement("span");

    item.className = "chain-item";
    name.textContent = chain.name;
    details.textContent = `想定還元率: ${formatRewardRate(chain.rewardRate)} / ${chain.note}`;
    item.append(name, details);

    return item;
  }

  function updateSelectionState(areaKey) {
    overlayButtons.forEach((button, key) => {
      const isSelected = key === areaKey;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    legendButtons.forEach((button, key) => {
      const isSelected = key === areaKey;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function updateScenarioState(scenarioKey) {
    scenarioButtons.forEach((button, key) => {
      const isSelected = key === scenarioKey;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    elements.activeScenarioLabel.textContent = scenarioData[scenarioKey].label;
    elements.scenarioCaption.textContent = scenarioData[scenarioKey].caption;
    elements.autoplayToggle.setAttribute("aria-pressed", String(autoplayEnabled));
    elements.autoplayToggle.textContent = `自動再生: ${autoplayEnabled ? "ON" : "OFF"}`;
  }

  function applyOverlayActivity() {
    areaKeys.forEach((areaKey) => {
      const scenario = getScenarioDetail(areaKey, activeScenarioKey);
      const overlayButton = overlayButtons.get(areaKey);
      const legendButton = legendButtons.get(areaKey);
      const label = overlayButton ? overlayButton.querySelector("small") : null;
      const intensity = scenario.intensity;

      if (overlayButton) {
        overlayButton.style.setProperty("--overlay-fill", `${20 + intensity * 24}%`);
        overlayButton.style.setProperty("--overlay-selected-fill", `${30 + intensity * 20}%`);
        overlayButton.style.setProperty("--overlay-border", `${38 + intensity * 30}%`);
        overlayButton.style.setProperty("--overlay-scale", (1 + intensity * 0.03).toFixed(3));
        overlayButton.style.setProperty("--overlay-glow-blur", `${18 + intensity * 18}px`);
        overlayButton.style.setProperty("--overlay-pulse-speed", `${(3.9 - intensity * 1.5).toFixed(2)}s`);
        overlayButton.style.setProperty("--overlay-sheen-opacity", `${(0.28 + intensity * 0.44).toFixed(2)}`);
      }

      if (label) {
        label.textContent = scenario.overlayLabel;
      }

      if (legendButton) {
        legendButton.style.setProperty("--legend-fill", `${10 + intensity * 55}%`);
      }
    });
  }

  function updateAccent(areaKey) {
    const color = areaData[areaKey].overlay.color;

    elements.mapPanel.style.setProperty("--selected-overlay-color", color);
    elements.detailPanel.style.setProperty("--selected-overlay-color", color);
  }

  function pulsePanel(panel) {
    if (!panel) {
      return;
    }

    panel.classList.remove("is-refreshing");
    void panel.offsetWidth;
    panel.classList.add("is-refreshing");
    window.setTimeout(() => {
      panel.classList.remove("is-refreshing");
    }, 420);
  }

  function updateLiveTimestamp() {
    elements.lastUpdated.textContent = formatUpdatedAt(new Date());
  }

  function renderArea(areaKey) {
    const area = areaData[areaKey];
    const scenario = area ? getScenarioDetail(areaKey, activeScenarioKey) : null;

    if (!area || !scenario) {
      return;
    }

    const statItems = scenario.stats.map(createStatItem);
    const chainItems = buildChains(areaKey, activeScenarioKey).map(createChainItem);

    elements.selectedOverlayLabel.textContent = area.name;
    elements.selectedOverlayRadius.textContent = area.overlay.radius;
    elements.selectedAreaBadge.textContent = scenario.overlayLabel;
    elements.selectedAreaLabel.textContent = scenario.summary;
    elements.selectedCardLabel.textContent = scenario.recommendation.card;
    elements.selectedReasonLabel.textContent = scenario.recommendation.reason;
    elements.liveStatus.textContent = scenario.live.status;
    elements.estimatedSavings.textContent = scenario.live.savings;
    elements.savingsNote.textContent = scenario.live.savingsNote;
    elements.crowdScore.textContent = scenario.live.crowdScore;
    elements.crowdNote.textContent = scenario.live.crowdNote;
    elements.rangeStats.replaceChildren(...statItems);
    elements.chainList.replaceChildren(...chainItems);

    updateAccent(areaKey);
    updateSelectionState(areaKey);
    updateLiveTimestamp();
    pulsePanel(elements.mapPanel);
    pulsePanel(elements.detailPanel);

    activeAreaKey = areaKey;
  }

  function renderScenario(scenarioKey) {
    if (!scenarioData[scenarioKey]) {
      return;
    }

    activeScenarioKey = scenarioKey;
    updateScenarioState(scenarioKey);
    applyOverlayActivity();
    renderArea(activeAreaKey || getDominantAreaForScenario(scenarioKey));
  }

  function setAutoplay(enabled) {
    autoplayEnabled = enabled;

    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = 0;
    }

    if (enabled) {
      autoplayTimer = window.setInterval(() => {
        const currentIndex = scenarioKeys.indexOf(activeScenarioKey);
        const nextScenarioKey = scenarioKeys[(currentIndex + 1) % scenarioKeys.length];
        renderScenario(nextScenarioKey);
      }, 4800);
    }

    updateScenarioState(activeScenarioKey);
  }

  function handleAreaSelection(event) {
    const trigger = event.target.closest("[data-area]");

    if (!trigger) {
      return;
    }

    renderArea(trigger.dataset.area);
  }

  function handleScenarioSelection(event) {
    const trigger = event.target.closest("[data-scenario]");

    if (!trigger) {
      return;
    }

    renderScenario(trigger.dataset.scenario);
  }

  function handleAutoplayToggle() {
    setAutoplay(!autoplayEnabled);
  }

  elements.areaMap.addEventListener("click", handleAreaSelection);
  elements.mapLegend.addEventListener("click", handleAreaSelection);
  elements.scenarioControls.addEventListener("click", handleScenarioSelection);
  elements.autoplayToggle.addEventListener("click", handleAutoplayToggle);

  renderOverlayButtons();
  renderLegend();
  renderScenarioControls();

  activeAreaKey = getDominantAreaForScenario(activeScenarioKey);
  renderScenario(activeScenarioKey);
  clockTimer = window.setInterval(updateLiveTimestamp, 60000);

  window.addEventListener("beforeunload", () => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
    }

    if (clockTimer) {
      window.clearInterval(clockTimer);
    }
  });
})();
