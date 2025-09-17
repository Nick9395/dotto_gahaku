document.addEventListener('DOMContentLoaded', function() {
  const appState = {
    currentColor: 'black'
  };
  init(appState);
});

function init(appState) {
  setupColorPalette(appState);
  setupDrawingGrid(appState);
  setupColorPicker(appState);
  setupMessageBox();
  loadFromLocalStorage();
}

// パレット処理
function setupColorPalette(appState) {
  const palette = document.getElementById('palette');

  palette.addEventListener('click', function(e) {
    if (e.target.classList.contains('color-option')) {
      appState.currentColor = e.target.getAttribute('data-color');
    }
  });
}

// カスタムカラーピッカー
function setupColorPicker(appState) {
  const openBtn = document.getElementById('openColorPicker');
  const closeBtn = document.getElementById('closeColorPicker');
  const popup = document.getElementById('colorPopup');
  const picker = document.getElementById('customColor');

  openBtn.addEventListener('click', function() {
    const rect = openBtn.getBoundingClientRect();
    popup.style.top = rect.bottom + window.scrollY + 'px';
    popup.style.left = rect.left + window.scrollX + 'px';
    popup.style.display = 'block';
  });

  closeBtn.addEventListener('click', function() {
    popup.style.display = 'none';
  });

  picker.addEventListener('input', function() {
    appState.currentColor = picker.value;
  });
}

// グリッド処理
function setupDrawingGrid(appState) {
  const grid = document.getElementById('grid');
  const gridSize = 60;
  let isDrawing = false;
  let drawMode = null;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');

    cell.addEventListener('mousedown', function(e) {
      if (e.button === 0) cell.style.backgroundColor = appState.currentColor;
      else if (e.button === 2) cell.style.backgroundColor = 'white';
    });

    cell.addEventListener('mouseover', function() {
      if (!isDrawing) return;
      if (drawMode === 'paint') cell.style.backgroundColor = appState.currentColor;
      if (drawMode === 'erase') cell.style.backgroundColor = 'white';
    });

    grid.appendChild(cell);
  }

  document.addEventListener('mousedown', function(e) {
    isDrawing = true;
    drawMode = (e.button === 0) ? 'paint' : 'erase';
  });

  document.addEventListener('mouseup', function() {
    isDrawing = false;
    drawMode = null;
  });

  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
}

// メッセージボックス
function setupMessageBox() {
  const msgBox = document.getElementById('msg-box');
  const msgText = document.getElementById('msg-text');
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');

  const saveBtn = document.getElementById('task-save-btn');
  const deleteBtn = document.getElementById('task-delete-btn');
  const dlBtn = document.getElementById('dl-btn');
  const howToLink = document.getElementById('how-to-link');

  let onYes = null;

  function openMessage(message, yesCallback) {
    msgText.innerText = message;
    msgBox.style.display = 'flex';
    yesBtn.focus();
    onYes = yesCallback;
  }

  yesBtn.addEventListener('click', function() {
    if (onYes) onYes();
    msgBox.style.display = 'none';
  });

  noBtn.addEventListener('click', function() {
    msgBox.style.display = 'none';
  });

  saveBtn.addEventListener('click', function() {
    saveGrid();
  });

  deleteBtn.addEventListener('click', function() {
    openMessage("保存した編集内容を削除しますか？", deleteGrid);
  });

  dlBtn.addEventListener('click', function() {
    openMessage("作成したドット絵を画像ファイル(透過png)で保存しますか？", downloadGridAsImage);
  });

  howToLink.addEventListener('click', function(e) {
    e.preventDefault(); // デフォルトのリンク動作を一時停止
    openMessage("保存していない編集内容は破棄されます。ページを移動しますか？", function() {
      window.location.href = howToLink.href;
    });
  });
}


// 編集を保存・削除・画像ダウンロード
function saveGrid() {
  const cells = document.querySelectorAll('.cell');
  const colors = Array.from(cells).map(function(cell) {
    return cell.style.backgroundColor || 'white';
  });
  localStorage.setItem('dotEditorData', JSON.stringify(colors));
  showFlashMessage("編集内容を保存しました");
}

function deleteGrid() {
  localStorage.removeItem('dotEditorData');
  document.querySelectorAll('.cell').forEach(function(cell) {
    cell.style.backgroundColor = 'white';
  });
  showFlashMessage("編集内容を削除しました");
}

function downloadGridAsImage() {
  const gridSize = 60;
  const cellSize = 10;

  const canvas = document.createElement('canvas');
  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;
  const ctx = canvas.getContext('2d');

  const cells = document.querySelectorAll('.cell');
  cells.forEach(function(cell, index) {
    const x = (index % gridSize) * cellSize;
    const y = Math.floor(index / gridSize) * cellSize;
    const color = window.getComputedStyle(cell).backgroundColor;

    if (color !== 'rgb(255, 255, 255)' && color !== 'white') {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  });

  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = 'dot_image.png';
  link.click();
}

// 保存データの読み込み
function loadFromLocalStorage() {
  const saved = localStorage.getItem('dotEditorData');
  if (!saved) return;

  const colors = JSON.parse(saved);
  const cells = document.querySelectorAll('.cell');
  colors.forEach(function(color, i) {
    if (cells[i]) cells[i].style.backgroundColor = color;
  });
}

// フラッシュメッセージ
function showFlashMessage(message) {
  const flash = document.getElementById('flash-msg');
  flash.textContent = message;
  flash.style.display = 'block';
  flash.classList.remove('hide');

  setTimeout(function () {
    flash.classList.add('hide');
  }, 2800); // 少し早めにフェードアウト開始

  setTimeout(function () {
    flash.style.display = 'none';
    flash.classList.remove('hide');
  }, 3000); // 完全に非表示
}