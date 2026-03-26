/**
 * テニススイング分析アプリ v2.0
 * BlazePose（MediaPipe）を使った高精度33キーポイント骨格検出
 * スロー再生・コマ送り対応
 */
(function () {
  "use strict";

  /* ── 要素の取得 ── */
  const video = document.getElementById("video");
  const canvas = document.getElementById("skeleton-canvas");
  const ctx = canvas.getContext("2d");
  const placeholder = document.getElementById("placeholder");
  const btnCamera = document.getElementById("btn-camera");
  const btnSnapshot = document.getElementById("btn-snapshot");
  const btnStop = document.getElementById("btn-stop");
  const videoUpload = document.getElementById("video-upload");
  const statusText = document.getElementById("status-text");
  const statusDot = document.querySelector(".status-dot");
  const fpsDisplay = document.getElementById("fps-display");

  /* 再生コントロール要素 */
  const playbackBar = document.getElementById("playback-bar");
  const btnPlayPause = document.getElementById("btn-play-pause");
  const btnFrameBack = document.getElementById("btn-frame-back");
  const btnFrameForward = document.getElementById("btn-frame-forward");
  const seekBar = document.getElementById("seek-bar");
  const playbackTime = document.getElementById("playback-time");
  const iconPlay = document.getElementById("icon-play");
  const iconPause = document.getElementById("icon-pause");
  const speedBtns = document.querySelectorAll(".speed-btn");

  /* ── タブ切り替え ── */
  const tabs = document.querySelectorAll(".panel-tab");
  const tabContents = {
    metrics: document.getElementById("tab-metrics"),
    guide: document.getElementById("tab-guide"),
  };

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      var target = tab.getAttribute("data-tab");
      Object.keys(tabContents).forEach(function (key) {
        tabContents[key].classList.toggle("active", key === target);
      });
    });
  });

  /* ── BlazePose 33キーポイントのインデックス定義 ── */
  const KP = {
    NOSE: 0,
    LEFT_EYE_INNER: 1,
    LEFT_EYE: 2,
    LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4,
    RIGHT_EYE: 5,
    RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7,
    RIGHT_EAR: 8,
    MOUTH_LEFT: 9,
    MOUTH_RIGHT: 10,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_PINKY: 17,
    RIGHT_PINKY: 18,
    LEFT_INDEX: 19,
    RIGHT_INDEX: 20,
    LEFT_THUMB: 21,
    RIGHT_THUMB: 22,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
    LEFT_HEEL: 29,
    RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31,
    RIGHT_FOOT_INDEX: 32,
  };

  /* ── 身体部位ごとの色定義（グラデーション描画用） ── */
  const LIMB_COLORS = {
    torso: { start: "#22d3ee", end: "#06b6d4" },       /* シアン系 — 体幹 */
    leftArm: { start: "#84cc16", end: "#65a30d" },      /* ライム — 左腕 */
    rightArm: { start: "#f97316", end: "#ea580c" },     /* オレンジ — 右腕 */
    leftLeg: { start: "#a78bfa", end: "#7c3aed" },      /* 紫 — 左脚 */
    rightLeg: { start: "#fb923c", end: "#f59e0b" },     /* アンバー — 右脚 */
    face: { start: "#e879f9", end: "#c026d3" },         /* ピンク — 顔 */
    leftHand: { start: "#4ade80", end: "#22c55e" },     /* 緑 — 左手 */
    rightHand: { start: "#fbbf24", end: "#f59e0b" },    /* 黄 — 右手 */
    leftFoot: { start: "#818cf8", end: "#6366f1" },     /* インディゴ — 左足 */
    rightFoot: { start: "#fb7185", end: "#e11d48" },    /* ローズ — 右足 */
  };

  /* ── 骨格の接続定義（部位・色情報付き） ── */
  const SKELETON_CONNECTIONS = [
    /* 体幹 */
    { from: KP.LEFT_SHOULDER, to: KP.RIGHT_SHOULDER, group: "torso" },
    { from: KP.LEFT_SHOULDER, to: KP.LEFT_HIP, group: "torso" },
    { from: KP.RIGHT_SHOULDER, to: KP.RIGHT_HIP, group: "torso" },
    { from: KP.LEFT_HIP, to: KP.RIGHT_HIP, group: "torso" },
    /* 顔 */
    { from: KP.NOSE, to: KP.LEFT_EYE, group: "face" },
    { from: KP.NOSE, to: KP.RIGHT_EYE, group: "face" },
    { from: KP.LEFT_EYE, to: KP.LEFT_EAR, group: "face" },
    { from: KP.RIGHT_EYE, to: KP.RIGHT_EAR, group: "face" },
    { from: KP.MOUTH_LEFT, to: KP.MOUTH_RIGHT, group: "face" },
    /* 左腕 */
    { from: KP.LEFT_SHOULDER, to: KP.LEFT_ELBOW, group: "leftArm" },
    { from: KP.LEFT_ELBOW, to: KP.LEFT_WRIST, group: "leftArm" },
    /* 左手 */
    { from: KP.LEFT_WRIST, to: KP.LEFT_PINKY, group: "leftHand" },
    { from: KP.LEFT_WRIST, to: KP.LEFT_INDEX, group: "leftHand" },
    { from: KP.LEFT_WRIST, to: KP.LEFT_THUMB, group: "leftHand" },
    { from: KP.LEFT_INDEX, to: KP.LEFT_PINKY, group: "leftHand" },
    /* 右腕 */
    { from: KP.RIGHT_SHOULDER, to: KP.RIGHT_ELBOW, group: "rightArm" },
    { from: KP.RIGHT_ELBOW, to: KP.RIGHT_WRIST, group: "rightArm" },
    /* 右手 */
    { from: KP.RIGHT_WRIST, to: KP.RIGHT_PINKY, group: "rightHand" },
    { from: KP.RIGHT_WRIST, to: KP.RIGHT_INDEX, group: "rightHand" },
    { from: KP.RIGHT_WRIST, to: KP.RIGHT_THUMB, group: "rightHand" },
    { from: KP.RIGHT_INDEX, to: KP.RIGHT_PINKY, group: "rightHand" },
    /* 左脚 */
    { from: KP.LEFT_HIP, to: KP.LEFT_KNEE, group: "leftLeg" },
    { from: KP.LEFT_KNEE, to: KP.LEFT_ANKLE, group: "leftLeg" },
    /* 左足 */
    { from: KP.LEFT_ANKLE, to: KP.LEFT_HEEL, group: "leftFoot" },
    { from: KP.LEFT_HEEL, to: KP.LEFT_FOOT_INDEX, group: "leftFoot" },
    { from: KP.LEFT_ANKLE, to: KP.LEFT_FOOT_INDEX, group: "leftFoot" },
    /* 右脚 */
    { from: KP.RIGHT_HIP, to: KP.RIGHT_KNEE, group: "rightLeg" },
    { from: KP.RIGHT_KNEE, to: KP.RIGHT_ANKLE, group: "rightLeg" },
    /* 右足 */
    { from: KP.RIGHT_ANKLE, to: KP.RIGHT_HEEL, group: "rightFoot" },
    { from: KP.RIGHT_HEEL, to: KP.RIGHT_FOOT_INDEX, group: "rightFoot" },
    { from: KP.RIGHT_ANKLE, to: KP.RIGHT_FOOT_INDEX, group: "rightFoot" },
  ];

  /* ── 主要関節（大きめに描画するキーポイント） ── */
  const MAJOR_JOINTS = new Set([
    KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER,
    KP.LEFT_ELBOW, KP.RIGHT_ELBOW,
    KP.LEFT_WRIST, KP.RIGHT_WRIST,
    KP.LEFT_HIP, KP.RIGHT_HIP,
    KP.LEFT_KNEE, KP.RIGHT_KNEE,
    KP.LEFT_ANKLE, KP.RIGHT_ANKLE,
  ]);

  /* ── キーポイントごとの色マッピング ── */
  function getPointColor(index) {
    if (index <= 10) return LIMB_COLORS.face.start;
    if (index === KP.LEFT_SHOULDER || index === KP.LEFT_ELBOW) return LIMB_COLORS.leftArm.start;
    if (index === KP.RIGHT_SHOULDER || index === KP.RIGHT_ELBOW) return LIMB_COLORS.rightArm.start;
    if (index === KP.LEFT_WRIST || index === KP.LEFT_PINKY || index === KP.LEFT_INDEX || index === KP.LEFT_THUMB) return LIMB_COLORS.leftHand.start;
    if (index === KP.RIGHT_WRIST || index === KP.RIGHT_PINKY || index === KP.RIGHT_INDEX || index === KP.RIGHT_THUMB) return LIMB_COLORS.rightHand.start;
    if (index === KP.LEFT_HIP || index === KP.LEFT_KNEE) return LIMB_COLORS.leftLeg.start;
    if (index === KP.RIGHT_HIP || index === KP.RIGHT_KNEE) return LIMB_COLORS.rightLeg.start;
    if (index === KP.LEFT_ANKLE || index === KP.LEFT_HEEL || index === KP.LEFT_FOOT_INDEX) return LIMB_COLORS.leftFoot.start;
    if (index === KP.RIGHT_ANKLE || index === KP.RIGHT_HEEL || index === KP.RIGHT_FOOT_INDEX) return LIMB_COLORS.rightFoot.start;
    return "#84cc16";
  }

  /* ── 状態管理 ── */
  let detector = null;
  let animFrameId = null;
  let stream = null;
  let lastTime = 0;
  let frameCount = 0;
  let fps = 0;
  let isVideoMode = false;
  let isPlaying = false;
  let currentSpeed = 1;
  let isSeeking = false;
  const MIN_CONFIDENCE = 0.3;
  const FRAME_STEP = 1 / 30; /* コマ送り間隔（約30fps想定） */

  /* ── キーポイント平滑化用バッファ ── */
  let prevKeypoints = null;
  const SMOOTHING_FACTOR = 0.4; /* 0に近いほど滑らか */

  /* ── ユーティリティ: 3点間の角度を度数で返す ── */
  function calcAngle(a, b, c) {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const cross = ab.x * cb.y - ab.y * cb.x;
    const rad = Math.atan2(Math.abs(cross), dot);
    return (rad * 180) / Math.PI;
  }

  /* ── ユーティリティ: 2点の中点を返す ── */
  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  /* ── ユーティリティ: キーポイントが有効か判定 ── */
  function isValid(kp) {
    return kp && kp.score >= MIN_CONFIDENCE;
  }

  /* ── ユーティリティ: object-fit: contain による映像の実際の描画領域を計算 ── */
  function getVideoFitRect() {
    var containerW = video.clientWidth;
    var containerH = video.clientHeight;
    var videoW = video.videoWidth;
    var videoH = video.videoHeight;
    if (!videoW || !videoH) return null;
    var scale = Math.min(containerW / videoW, containerH / videoH);
    var displayW = videoW * scale;
    var displayH = videoH * scale;
    var offsetX = (containerW - displayW) / 2;
    var offsetY = (containerH - displayH) / 2;
    return { offsetX: offsetX, offsetY: offsetY, displayW: displayW, displayH: displayH };
  }

  /* ── canvasの位置・サイズを映像の描画領域に合わせる ── */
  function syncCanvasPosition() {
    var rect = getVideoFitRect();
    if (rect) {
      canvas.style.left = rect.offsetX + "px";
      canvas.style.top = rect.offsetY + "px";
      canvas.style.width = rect.displayW + "px";
      canvas.style.height = rect.displayH + "px";
    }
  }

  /* ── キーポイント平滑化 ── */
  function smoothKeypoints(keypoints) {
    if (!prevKeypoints) {
      prevKeypoints = keypoints.map(function (kp) {
        return { x: kp.x, y: kp.y, score: kp.score, name: kp.name };
      });
      return keypoints;
    }

    var smoothed = keypoints.map(function (kp, i) {
      var prev = prevKeypoints[i];
      if (!isValid(kp) || !prev) return kp;
      return {
        x: prev.x + SMOOTHING_FACTOR * (kp.x - prev.x),
        y: prev.y + SMOOTHING_FACTOR * (kp.y - prev.y),
        score: kp.score,
        name: kp.name,
      };
    });

    prevKeypoints = smoothed.map(function (kp) {
      return { x: kp.x, y: kp.y, score: kp.score, name: kp.name };
    });
    return smoothed;
  }

  /* ── ステータス表示の更新 ── */
  function setStatus(text, active) {
    statusText.textContent = text;
    statusDot.classList.toggle("active", !!active);
  }

  /* ── モデルの初期化（BlazePose FULL） ── */
  async function initDetector() {
    setStatus("BlazePoseモデルを読み込み中…", false);
    var model = poseDetection.SupportedModels.BlazePose;
    detector = await poseDetection.createDetector(model, {
      runtime: "mediapipe",
      modelType: "full",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404",
      enableSmoothing: true,
    });
    setStatus("モデル準備完了（BlazePose FULL）", false);
  }

  /* ── カメラ起動 ── */
  async function startCamera() {
    try {
      stopAll();
      isVideoMode = false;
      playbackBar.classList.add("hidden");
      setStatus("カメラを起動中…", false);
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      isPlaying = true;
      placeholder.classList.add("hidden");
      btnSnapshot.disabled = false;
      btnStop.disabled = false;

      if (!detector) await initDetector();
      setStatus("分析中", true);
      fpsDisplay.classList.add("visible");
      detectLoop();
    } catch (err) {
      setStatus("カメラ起動失敗: " + err.message, false);
    }
  }

  /* ── 動画アップロード ── */
  async function loadVideo(file) {
    stopAll();
    isVideoMode = true;
    setStatus("動画を読み込み中…", false);
    var url = URL.createObjectURL(file);
    video.srcObject = null;
    video.src = url;
    video.muted = true;
    video.loop = false;
    video.playbackRate = currentSpeed;
    await video.play();
    isPlaying = true;
    placeholder.classList.add("hidden");
    btnSnapshot.disabled = false;
    btnStop.disabled = false;

    /* 再生コントロールを表示 */
    playbackBar.classList.remove("hidden");
    updatePlayPauseIcon();

    if (!detector) await initDetector();
    setStatus("分析中（動画）", true);
    fpsDisplay.classList.add("visible");
    detectLoop();
  }

  /* ── 検出ループ ── */
  function detectLoop() {
    animFrameId = requestAnimationFrame(async function loop(timestamp) {
      /* FPS 計算 */
      frameCount++;
      if (timestamp - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = timestamp;
        fpsDisplay.textContent = fps + " FPS";
      }

      /* シークバーの時間表示を更新 */
      if (isVideoMode && !isSeeking) {
        updateSeekBar();
      }

      if (video.readyState >= 2 && detector) {
        /* Canvas サイズを映像に合わせる */
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        syncCanvasPosition();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
          var poses = await detector.estimatePoses(video);
          if (poses.length > 0) {
            var keypoints = poses[0].keypoints;
            var smoothed = smoothKeypoints(keypoints);
            drawBodyMesh(smoothed);
            drawSkeleton(smoothed);
            updateMetrics(smoothed);
          }
        } catch (_) {
          /* 検出エラーは無視して次フレームへ */
        }
      }

      animFrameId = requestAnimationFrame(loop);
    });
  }

  /* ── 体幹メッシュを描画（半透明の塗りつぶし） ── */
  function drawBodyMesh(keypoints) {
    var ls = keypoints[KP.LEFT_SHOULDER];
    var rs = keypoints[KP.RIGHT_SHOULDER];
    var lh = keypoints[KP.LEFT_HIP];
    var rh = keypoints[KP.RIGHT_HIP];

    if (isValid(ls) && isValid(rs) && isValid(lh) && isValid(rh)) {
      ctx.beginPath();
      ctx.moveTo(ls.x, ls.y);
      ctx.lineTo(rs.x, rs.y);
      ctx.lineTo(rh.x, rh.y);
      ctx.lineTo(lh.x, lh.y);
      ctx.closePath();
      ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
      ctx.fill();
    }
  }

  /* ── 骨格を描画（グラデーション＋グロー） ── */
  function drawSkeleton(keypoints) {
    /* ボーン（接続線）をグループ色付きで描画 */
    for (var i = 0; i < SKELETON_CONNECTIONS.length; i++) {
      var conn = SKELETON_CONNECTIONS[i];
      var a = keypoints[conn.from];
      var b = keypoints[conn.to];
      if (!isValid(a) || !isValid(b)) continue;

      var colors = LIMB_COLORS[conn.group];
      var confidence = Math.min(a.score, b.score);

      /* グラデーションの作成 */
      var grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, colors.start);
      grad.addColorStop(1, colors.end);

      /* グロー効果（ぼかし付き太線を先に描画） */
      ctx.save();
      ctx.globalAlpha = confidence * 0.3;
      ctx.strokeStyle = colors.start;
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.filter = "blur(4px)";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();

      /* メインのボーン線 */
      ctx.save();
      ctx.globalAlpha = Math.max(confidence, 0.5);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    /* キーポイント（関節点）を描画 */
    for (var j = 0; j < keypoints.length; j++) {
      var kp = keypoints[j];
      if (!isValid(kp)) continue;

      var isMajor = MAJOR_JOINTS.has(j);
      var outerR = isMajor ? 8 : 4;
      var innerR = isMajor ? 6 : 3;
      var color = getPointColor(j);

      /* グロー */
      if (isMajor) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.filter = "blur(6px)";
        ctx.fill();
        ctx.restore();
      }

      /* 外側の円（白いリング） */
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, outerR, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = Math.max(kp.score, 0.5);
      ctx.fill();
      ctx.globalAlpha = 1;

      /* 内側の円（部位カラー） */
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, innerR, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }

    /* 角度のラベルを描画 */
    drawAngleLabel(keypoints, KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW, KP.RIGHT_WRIST, "肘");
    drawAngleLabel(keypoints, KP.RIGHT_HIP, KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW, "肩");
    drawAngleLabel(keypoints, KP.RIGHT_HIP, KP.RIGHT_KNEE, KP.RIGHT_ANKLE, "膝");
  }

  /* ── 角度ラベルをキャンバス上に描画 ── */
  function drawAngleLabel(keypoints, a, b, c, label) {
    var kpA = keypoints[a];
    var kpB = keypoints[b];
    var kpC = keypoints[c];
    if (!isValid(kpA) || !isValid(kpB) || !isValid(kpC)) return;

    var angle = Math.round(calcAngle(kpA, kpB, kpC));
    var fontSize = Math.max(12, Math.min(canvas.width / 40, 16));
    ctx.font = "bold " + fontSize + "px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1;
    var text = label + " " + angle + "°";
    var tx = kpB.x + 12;
    var ty = kpB.y - 12;
    ctx.strokeText(text, tx, ty);
    ctx.fillText(text, tx, ty);
  }

  /* ── 数値パネルを更新 ── */
  function updateMetrics(keypoints) {
    var kp = keypoints;

    /* 肘角度（右腕） */
    updateSingleMetric("elbow", kp[KP.RIGHT_SHOULDER], kp[KP.RIGHT_ELBOW], kp[KP.RIGHT_WRIST], 180);

    /* 肩角度（右腕の振り上げ） */
    updateSingleMetric("shoulder", kp[KP.RIGHT_HIP], kp[KP.RIGHT_SHOULDER], kp[KP.RIGHT_ELBOW], 180);

    /* 膝角度（右脚） */
    updateSingleMetric("knee", kp[KP.RIGHT_HIP], kp[KP.RIGHT_KNEE], kp[KP.RIGHT_ANKLE], 180);

    /* 体幹傾斜 */
    if (
      isValid(kp[KP.LEFT_SHOULDER]) &&
      isValid(kp[KP.RIGHT_SHOULDER]) &&
      isValid(kp[KP.LEFT_HIP]) &&
      isValid(kp[KP.RIGHT_HIP])
    ) {
      var shoulderMid = midpoint(kp[KP.LEFT_SHOULDER], kp[KP.RIGHT_SHOULDER]);
      var hipMid = midpoint(kp[KP.LEFT_HIP], kp[KP.RIGHT_HIP]);
      var dx = shoulderMid.x - hipMid.x;
      var dy = hipMid.y - shoulderMid.y;
      var trunk = Math.round((Math.atan2(Math.abs(dx), dy) * 180) / Math.PI);
      setMetricDisplay("trunk", trunk, "°", trunk / 45);
    }

    /* 肩回旋 */
    if (isValid(kp[KP.LEFT_SHOULDER]) && isValid(kp[KP.RIGHT_SHOULDER])) {
      var sdx = kp[KP.RIGHT_SHOULDER].x - kp[KP.LEFT_SHOULDER].x;
      var sdy = kp[KP.RIGHT_SHOULDER].y - kp[KP.LEFT_SHOULDER].y;
      var rotation = Math.round(Math.abs((Math.atan2(sdy, sdx) * 180) / Math.PI));
      setMetricDisplay("rotation", rotation, "°", rotation / 90);
    }

    /* 股関節角度（右脚） */
    updateSingleMetric("hip", kp[KP.RIGHT_SHOULDER], kp[KP.RIGHT_HIP], kp[KP.RIGHT_KNEE], 180);

    /* 手首角度（右手 — BlazePoseの追加キーポイント活用） */
    updateSingleMetric("wrist", kp[KP.RIGHT_ELBOW], kp[KP.RIGHT_WRIST], kp[KP.RIGHT_INDEX], 180);

    /* 足首角度（右足 — BlazePoseの追加キーポイント活用） */
    updateSingleMetric("ankle", kp[KP.RIGHT_KNEE], kp[KP.RIGHT_ANKLE], kp[KP.RIGHT_FOOT_INDEX], 180);
  }

  /* ── 3点角度系の指標を更新するヘルパー ── */
  function updateSingleMetric(id, a, b, c, maxAngle) {
    if (!isValid(a) || !isValid(b) || !isValid(c)) return;
    var angle = Math.round(calcAngle(a, b, c));
    setMetricDisplay(id, angle, "°", angle / maxAngle);
  }

  /* ── DOM上の数値・バーを更新 ── */
  function setMetricDisplay(id, value, unit, ratio) {
    var valEl = document.getElementById("val-" + id);
    var barEl = document.getElementById("bar-" + id);
    if (valEl) valEl.textContent = value + unit;
    if (barEl) {
      var pct = Math.min(Math.max(ratio * 100, 0), 100);
      barEl.style.width = pct + "%";
      if (pct < 30) {
        barEl.style.backgroundColor = "#f59e0b";
      } else if (pct > 85) {
        barEl.style.backgroundColor = "#ef4444";
      } else {
        barEl.style.backgroundColor = "#84cc16";
      }
    }
  }

  /* ── 再生コントロール ── */

  /* 再生/一時停止の切り替え */
  function togglePlayPause() {
    if (!isVideoMode) return;
    if (video.paused) {
      video.play();
      isPlaying = true;
    } else {
      video.pause();
      isPlaying = false;
    }
    updatePlayPauseIcon();
  }

  /* アイコンの表示切り替え */
  function updatePlayPauseIcon() {
    if (video.paused) {
      iconPlay.classList.remove("hidden");
      iconPause.classList.add("hidden");
    } else {
      iconPlay.classList.add("hidden");
      iconPause.classList.remove("hidden");
    }
  }

  /* コマ送り（前方） */
  function frameForward() {
    if (!isVideoMode) return;
    video.pause();
    isPlaying = false;
    video.currentTime = Math.min(video.currentTime + FRAME_STEP, video.duration);
    updatePlayPauseIcon();
  }

  /* コマ戻し */
  function frameBack() {
    if (!isVideoMode) return;
    video.pause();
    isPlaying = false;
    video.currentTime = Math.max(video.currentTime - FRAME_STEP, 0);
    updatePlayPauseIcon();
  }

  /* 速度変更 */
  function setSpeed(speed) {
    currentSpeed = speed;
    video.playbackRate = speed;
    speedBtns.forEach(function (btn) {
      btn.classList.toggle("active", parseFloat(btn.getAttribute("data-speed")) === speed);
    });
  }

  /* シークバー更新 */
  function updateSeekBar() {
    if (!video.duration || !isFinite(video.duration)) return;
    var progress = (video.currentTime / video.duration) * 1000;
    seekBar.value = Math.round(progress);
    playbackTime.textContent = formatTime(video.currentTime) + " / " + formatTime(video.duration);
  }

  /* 時間フォーマット */
  function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ── 停止処理 ── */
  function stopAll() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
    video.srcObject = null;
    video.src = "";
    video.load();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    placeholder.classList.remove("hidden");
    playbackBar.classList.add("hidden");
    btnSnapshot.disabled = true;
    btnStop.disabled = true;
    fpsDisplay.textContent = "";
    fpsDisplay.classList.remove("visible");
    isVideoMode = false;
    isPlaying = false;
    prevKeypoints = null;
    setStatus("待機中", false);
    resetMetrics();
  }

  /* ── 数値をリセット ── */
  function resetMetrics() {
    var ids = ["elbow", "shoulder", "knee", "trunk", "rotation", "hip", "wrist", "ankle"];
    ids.forEach(function (id) {
      var valEl = document.getElementById("val-" + id);
      var barEl = document.getElementById("bar-" + id);
      if (valEl) valEl.textContent = "--°";
      if (barEl) {
        barEl.style.width = "0%";
        barEl.style.backgroundColor = "var(--app-accent)";
      }
    });
  }

  /* ── スナップショット保存 ── */
  function takeSnapshot() {
    var tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = video.videoWidth;
    tmpCanvas.height = video.videoHeight;
    var tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage(video, 0, 0);
    tmpCtx.drawImage(canvas, 0, 0);

    /* ダウンロードリンクをDOMに追加してからクリック（ブラウザ互換性対策） */
    var link = document.createElement("a");
    link.download = "swing-analysis-" + new Date().toISOString().slice(0, 19) + ".png";
    link.href = tmpCanvas.toDataURL("image/png");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ── イベントリスナー ── */
  /* ── ウィンドウリサイズ時にcanvas位置を再計算 ── */
  window.addEventListener("resize", syncCanvasPosition);

  btnCamera.addEventListener("click", startCamera);

  videoUpload.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      loadVideo(this.files[0]);
    }
  });

  btnSnapshot.addEventListener("click", takeSnapshot);
  btnStop.addEventListener("click", stopAll);

  /* 再生コントロール */
  btnPlayPause.addEventListener("click", togglePlayPause);
  btnFrameForward.addEventListener("click", frameForward);
  btnFrameBack.addEventListener("click", frameBack);

  /* 速度ボタン */
  speedBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setSpeed(parseFloat(this.getAttribute("data-speed")));
    });
  });

  /* シークバー操作 */
  seekBar.addEventListener("input", function () {
    isSeeking = true;
    if (video.duration && isFinite(video.duration)) {
      var time = (this.value / 1000) * video.duration;
      video.currentTime = time;
      playbackTime.textContent = formatTime(time) + " / " + formatTime(video.duration);
    }
  });

  seekBar.addEventListener("change", function () {
    isSeeking = false;
  });

  /* 動画の再生終了 */
  video.addEventListener("ended", function () {
    isPlaying = false;
    updatePlayPauseIcon();
  });

  /* キーボードショートカット */
  document.addEventListener("keydown", function (e) {
    if (!isVideoMode) return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePlayPause();
        break;
      case "ArrowRight":
        e.preventDefault();
        frameForward();
        break;
      case "ArrowLeft":
        e.preventDefault();
        frameBack();
        break;
      case "1":
        setSpeed(0.25);
        break;
      case "2":
        setSpeed(0.5);
        break;
      case "3":
        setSpeed(0.75);
        break;
      case "4":
        setSpeed(1);
        break;
    }
  });
})();
