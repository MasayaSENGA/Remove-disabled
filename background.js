// 拡張機能がインストールされた時にコンテキストメニューを登録
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "removeDisabled",
    title: "disabled属性を削除", 
    contexts: ["all"] 
  });
});

// メニューがクリックされた時の処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "removeDisabled" && tab.id) {
    // 現在のタブに対して、disabledを消す関数を実行
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: unlockAllDisabled
    });
  }
});

// ページ内で実行される関数
function unlockAllDisabled() {
  // disabled 属性を持つ要素をすべて取得
  const disabledElements = document.querySelectorAll('[disabled]');
  
  disabledElements.forEach(element => {
    // disabled 属性を削除
    element.removeAttribute('disabled');
    // JSのプロパティとしての disabled も false にする
    element.disabled = false;
  });

  // 一部のサイトで使われている、見た目だけdisabledにするクラス(Bootstrapなど)も解除
  const disabledClasses = document.querySelectorAll('.disabled');
  disabledClasses.forEach(element => {
    element.classList.remove('disabled');
  });

  // --- ここからトースト通知の表示処理 ---
  
  // トースト用の要素を作成
  const toast = document.createElement('div');
  toast.textContent = `${disabledElements.length} 個の要素の disabled を解除しました。`;
  
  // トーストのデザインと位置（画面右上）を設定
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#323232', // 背景色（ダークグレー）
    color: '#ffffff',           // 文字色（白）
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // 軽い影をつけて浮き上がらせる
    zIndex: '2147483647',       // ページ内のどの要素よりも最前面に表示
    fontSize: '14px',
    fontFamily: 'sans-serif',
    transition: 'opacity 0.5s ease', // ふんわり消えるアニメーション用
    pointerEvents: 'none'       // 通知の下にあるボタンなどをクリックできるようにする
  });

  // ページにトーストを追加して表示
  document.body.appendChild(toast);

  // 3秒後にふんわり消して、完全に消えたらHTMLから削除する
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500); // アニメーション時間(0.5秒)待ってから削除
  }, 3000); // 3000ミリ秒 = 3秒表示
}