// 拡張機能がインストールされた時にコンテキストメニューを登録
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "removeDisabled",
    title: "removeDisabled",
    contexts: ["all"] // ページのどこを右クリックしても表示
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

  // 応用：一部のサイトで使われている、見た目だけdisabledにするクラス(Bootstrapなど)も一応解除
  const disabledClasses = document.querySelectorAll('.disabled');
  disabledClasses.forEach(element => {
    element.classList.remove('disabled');
  });

  console.log(`${disabledElements.length} 個の要素の disabled を解除しました。`);
}