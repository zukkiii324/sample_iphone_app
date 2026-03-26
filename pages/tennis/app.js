/**
 * テニススイング分析アプリ
 * TensorFlow.js MoveNet を使った骨格検出とスイング数値の可視化
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
  const fpsDisplay = document.getElementById("fps-display");

  /* ── MoveNet キーポイントのインデックス定義 ── */
  const KP = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16,
  };

  /* ── 骨格の接続定義（ボーン） ── */
  const SKELETON_CONNECTIONS = [
    [KP.LEFT_SHOULDER, KP.RIGHT_SHOULDER],
    [KP.LEFT_SHOULDER, KP.LEFT_ELBOW],
    [KP.LEFT_ELBOW, KP.LEFT_WRIST],
    [KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW],
    [KP.RIGHT_ELBOW, KP.RIGHT_WRIST],
    [KP.LEFT_SHOULDER, KP.LEFT_HIP],
    [KP.RIGHT_SHOULDER, KP.RIGHT_HIP],
    [KP.LEFT_HIP, KP.RIGHT_HIP],
    [KP.LEFT_HIP, KP.LEFT_KNEE],
    [KP.LEFT_KNEE, KP.LEFT_ANKLE],
    [KP.RIGHT_HIP, KP.RIGHT_KNEE],
    [KP.RIGHT_KNEE, KP.RIGHT_ANKLE],
    [KP.NOSE, KP.LEFT_SHOULDER],
    [KP.NOSE, KP.RIGHT_SHOULDER],
  ];

  /* ── 状態管理 ── */
  let detector = null;
  let animFrameId = null;
  let stream = null;
  let lastTime = 0;
  let frameCount = 0;
  let fps = 0;
  const MIN_CONFIDENCE = 0.3;

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

  /* ── モデルの初期化 ── */
  async function initDetector() {
    statusText.textContent = "モデルを読み込み中…";
    const model = poseDetection.SupportedModels.MoveNet;
    detector = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    });
    statusText.textContent = "モデル準備完了";
  }

  /* ── カメラ起動 ── */
  async function startCamera() {
    try {
      stopAll();
      statusText.textContent = "カメラを起動中…";
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
        audio: false,
      });
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      placeholder.classList.add("hidden");
      btnSnapshot.disabled = false;
      btnStop.disabled = false;

      if (!detector) await initDetector();
      statusText.textContent = "分析中（カメラ）";
      detectLoop();
    } catch (err) {
      statusText.textContent = "カメラの起動に失敗しました: " + err.message;
    }
  }

  /* ── 動画アップロード ── */
  async function loadVideo(file) {
    stopAll();
    statusText.textContent = "動画を読み込み中…";
    const url = URL.createObjectURL(file);
    video.srcObject = null;
    video.src = url;
    video.muted = true;
    video.loop = true;
    await video.play();
    placeholder.classList.add("hidden");
    btnSnapshot.disabled = false;
    btnStop.disabled = false;

    if (!detector) await initDetector();
    statusText.textContent = "分析中（動画）";
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

      if (video.readyState >= 2 && detector) {
        /* Canvas サイズを映像に合わせる */
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
          const poses = await detector.estimatePoses(video);
          if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            drawSkeleton(keypoints);
            updateMetrics(keypoints);
          }
        } catch (_) {
          /* 検出エラーは無視して次フレームへ */
        }
      }

      animFrameId = requestAnimationFrame(loop);
    });
  }

  /* ── 骨格を描画 ── */
  function drawSkeleton(keypoints) {
    /* ボーン（接続線）を描画 */
    ctx.strokeStyle = "#84cc16";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    for (const [i, j] of SKELETON_CONNECTIONS) {
      const a = keypoints[i];
      const b = keypoints[j];
      if (isValid(a) && isValid(b)) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    /* キーポイント（関節点）を描画 */
    for (const kp of keypoints) {
      if (!isValid(kp)) continue;
      /* 外側の円（白いリング） */
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      /* 内側の円（アクセントカラー） */
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#65a30d";
      ctx.fill();
    }

    /* 角度のラベルを描画 */
    drawAngleLabel(keypoints, KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW, KP.RIGHT_WRIST, "肘");
    drawAngleLabel(keypoints, KP.RIGHT_HIP, KP.RIGHT_SHOULDER, KP.RIGHT_ELBOW, "肩");
    drawAngleLabel(keypoints, KP.RIGHT_HIP, KP.RIGHT_KNEE, KP.RIGHT_ANKLE, "膝");
  }

  /* ── 角度ラベルをキャンバス上に描画 ── */
  function drawAngleLabel(keypoints, a, b, c, label) {
    const kpA = keypoints[a];
    const kpB = keypoints[b];
    const kpC = keypoints[c];
    if (!isValid(kpA) || !isValid(kpB) || !isValid(kpC)) return;

    const angle = Math.round(calcAngle(kpA, kpB, kpC));
    const fontSize = Math.max(12, Math.min(canvas.width / 40, 16));
    ctx.font = "bold " + fontSize + "px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 3;
    const text = label + " " + angle + "°";
    const tx = kpB.x + 10;
    const ty = kpB.y - 10;
    ctx.strokeText(text, tx, ty);
    ctx.fillText(text, tx, ty);
  }

  /* ── 数値パネルを更新 ── */
  function updateMetrics(keypoints) {
    const kp = keypoints;

    /* 肘角度（右腕） */
    updateSingleMetric(
      "elbow",
      kp[KP.RIGHT_SHOULDER],
      kp[KP.RIGHT_ELBOW],
      kp[KP.RIGHT_WRIST],
      180
    );

    /* 肩角度（右腕の振り上げ） */
    updateSingleMetric(
      "shoulder",
      kp[KP.RIGHT_HIP],
      kp[KP.RIGHT_SHOULDER],
      kp[KP.RIGHT_ELBOW],
      180
    );

    /* 膝角度（右脚） */
    updateSingleMetric(
      "knee",
      kp[KP.RIGHT_HIP],
      kp[KP.RIGHT_KNEE],
      kp[KP.RIGHT_ANKLE],
      180
    );

    /* 体幹傾斜 */
    if (
      isValid(kp[KP.LEFT_SHOULDER]) &&
      isValid(kp[KP.RIGHT_SHOULDER]) &&
      isValid(kp[KP.LEFT_HIP]) &&
      isValid(kp[KP.RIGHT_HIP])
    ) {
      const shoulderMid = midpoint(kp[KP.LEFT_SHOULDER], kp[KP.RIGHT_SHOULDER]);
      const hipMid = midpoint(kp[KP.LEFT_HIP], kp[KP.RIGHT_HIP]);
      const dx = shoulderMid.x - hipMid.x;
      const dy = hipMid.y - shoulderMid.y;
      const trunk = Math.round(
        (Math.atan2(Math.abs(dx), dy) * 180) / Math.PI
      );
      setMetricDisplay("trunk", trunk, "°", trunk / 45);
    }

    /* 肩回旋 */
    if (isValid(kp[KP.LEFT_SHOULDER]) && isValid(kp[KP.RIGHT_SHOULDER])) {
      const dx = kp[KP.RIGHT_SHOULDER].x - kp[KP.LEFT_SHOULDER].x;
      const dy = kp[KP.RIGHT_SHOULDER].y - kp[KP.LEFT_SHOULDER].y;
      const rotation = Math.round(
        Math.abs((Math.atan2(dy, dx) * 180) / Math.PI)
      );
      setMetricDisplay("rotation", rotation, "°", rotation / 90);
    }

    /* 股関節角度（右脚） */
    updateSingleMetric(
      "hip",
      kp[KP.RIGHT_SHOULDER],
      kp[KP.RIGHT_HIP],
      kp[KP.RIGHT_KNEE],
      180
    );
  }

  /* ── 3点角度系の指標を更新するヘルパー ── */
  function updateSingleMetric(id, a, b, c, maxAngle) {
    if (!isValid(a) || !isValid(b) || !isValid(c)) return;
    const angle = Math.round(calcAngle(a, b, c));
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
      /* 値の範囲に応じて色を変える */
      if (pct < 30) {
        barEl.style.backgroundColor = "#f59e0b";
      } else if (pct > 85) {
        barEl.style.backgroundColor = "#ef4444";
      } else {
        barEl.style.backgroundColor = "#65a30d";
      }
    }
  }

  /* ── 停止処理 ── */
  function stopAll() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (stream) {
      stream.getTracks().forEach(function (t) {
        t.stop();
      });
      stream = null;
    }
    video.srcObject = null;
    video.src = "";
    video.load();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    placeholder.classList.remove("hidden");
    btnSnapshot.disabled = true;
    btnStop.disabled = true;
    fpsDisplay.textContent = "";
    statusText.textContent = "停止しました";
    resetMetrics();
  }

  /* ── 数値をリセット ── */
  function resetMetrics() {
    var ids = ["elbow", "shoulder", "knee", "trunk", "rotation", "hip"];
    ids.forEach(function (id) {
      var valEl = document.getElementById("val-" + id);
      var barEl = document.getElementById("bar-" + id);
      if (valEl) valEl.textContent = "--°";
      if (barEl) {
        barEl.style.width = "0%";
        barEl.style.backgroundColor = "var(--color-accent)";
      }
    });
  }

  /* ── スナップショット保存 ── */
  function takeSnapshot() {
    var tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = video.videoWidth;
    tmpCanvas.height = video.videoHeight;
    var tmpCtx = tmpCanvas.getContext("2d");

    /* 映像を描画 */
    tmpCtx.drawImage(video, 0, 0);
    /* 骨格オーバーレイを描画 */
    tmpCtx.drawImage(canvas, 0, 0);

    /* ダウンロード */
    var link = document.createElement("a");
    link.download =
      "swing-analysis-" + new Date().toISOString().slice(0, 19) + ".png";
    link.href = tmpCanvas.toDataURL("image/png");
    link.click();
  }

  /* ── イベントリスナー ── */
  btnCamera.addEventListener("click", startCamera);

  videoUpload.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      loadVideo(this.files[0]);
    }
  });

  btnSnapshot.addEventListener("click", takeSnapshot);
  btnStop.addEventListener("click", stopAll);
})();
