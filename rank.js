// オンラインランキングAPIのURL（例:Google Apps Script等）↓
const RANK_API_URL = "https://script.google.com/macros/s/AKfycbzvUQ4.../exec"; // ←自作APIに置き換えてください

let lastClearTime = null;
let lastIsInvincible = false;
let isRankPosted = false;

// ゲーム側からクリア時に呼ぶ
window.onGameClear = function(timeSec, isInvincibleMode) {
  lastClearTime = timeSec;
  lastIsInvincible = isInvincibleMode;
  if (!isInvincibleMode) {
    document.getElementById("rank-form").style.display = "";
    document.getElementById("rank-message").textContent = "お名前を入力して登録しよう！";
    fetchAndShowRanking();
  } else {
    document.getElementById("rank-form").style.display = "none";
    document.getElementById("rank-message").textContent = "無敵モードクリアはランキング登録できません";
    fetchAndShowRanking(); // ただし閲覧のみ
  }
};

// ランキング送信
document.getElementById("rank-form").onsubmit = function(e) {
  e.preventDefault();
  if (isRankPosted) return;
  const name = document.getElementById("rank-name").value.trim().replace(/[<>]/g,"").slice(0,10);
  if (!name) {
    document.getElementById("rank-message").textContent = "名前を入力してください";
    return;
  }
  if (lastClearTime == null) return;
  isRankPosted = true;
  document.getElementById("rank-submit").disabled = true;
  document.getElementById("rank-message").textContent = "登録中…";
  // 送信
  fetch(`${RANK_API_URL}?mode=post&name=${encodeURIComponent(name)}&time=${lastClearTime}`)
    .then(r=>r.json()).then(data=>{
      if (data && data.result === "ok") {
        document.getElementById("rank-message").textContent = "登録しました！";
        fetchAndShowRanking(name, lastClearTime);
      } else {
        document.getElementById("rank-message").textContent = "登録に失敗しました";
      }
    }).catch(()=>{
      document.getElementById("rank-message").textContent = "通信エラー";
    });
  return false;
};

function fetchAndShowRanking(myName, myTime) {
  fetch(`${RANK_API_URL}?mode=get`)
    .then(r=>r.json())
    .then(list=>{
      let html = "";
      let found = false;
      list = (list && Array.isArray(list)) ? list : [];
      if (list.length === 0) {
        html = "<li>まだ誰もクリアしていません</li>";
      } else {
        html = list.map((d,i)=>{
          let my = "";
          if (myName && myTime && d.name === myName && d.time == myTime) {
            my = '<span id="rank-your">あなた</span>';
            found = true;
          }
          return `<li>${i+1}. <span>${d.name}</span><span>${formatTime(d.time)}</span>${my}</li>`;
        }).join("");
      }
      document.getElementById("rank-list").innerHTML = html;
      if (myName && !found && myTime) {
        document.getElementById("rank-list").innerHTML += `<li style="background:#334">--- あなたの記録 --- <span>${myName}</span><span>${formatTime(myTime)}</span></li>`;
      }
    })
    .catch(()=>{
      document.getElementById("rank-list").innerHTML = "<li>ランキング取得失敗</li>";
    });
}

function formatTime(sec) {
  sec = Math.round(sec*100)/100;
  let s = Math.floor(sec);
  let ms = Math.floor((sec-s)*100);
  return s + "." + ("0"+ms).slice(-2) + " 秒";
}