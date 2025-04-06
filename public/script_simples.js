
const socket = io();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colorPicker = document.getElementById('colorPicker');
const toggleBtn = document.getElementById('toggleTool');
const clearBtn = document.getElementById('clearCanvas');
const cursorPreview = document.getElementById('cursorPreview');

let userName = '';
let roomName = '';
let drawing = false;
let prev = null;
let isEraser = false;

document.getElementById('joinBtn').addEventListener('click', () => {
  userName = document.getElementById('nameInput').value || 'Anônimo';
  roomName = document.getElementById('roomInput').value || 'geral';
  document.getElementById('loginScreen').style.display = 'none';
  socket.emit('join-room', { user: userName, room: roomName });
});

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  prev = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  prev = null;
});
canvas.addEventListener('mousemove', (e) => {
  const { clientX: x, clientY: y } = e;
  cursorPreview.style.display = 'block';
  cursorPreview.style.left = `${x - 5}px`;
  cursorPreview.style.top = `${y - 5}px`;
  cursorPreview.style.borderColor = isEraser ? '#ccc' : colorPicker.value;

  if (!drawing || !prev) return;

  const curr = { x, y };
  const color = isEraser ? '#ffffff' : colorPicker.value;
  drawLine(prev, curr, color);
  socket.emit('draw', { from: prev, to: curr, color, isEraser, user: userName, room: roomName });
  prev = curr;
});
canvas.addEventListener('mouseleave', () => {
  cursorPreview.style.display = 'none';
});

function drawLine(from, to, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

clearBtn.addEventListener('click', () => {
  socket.emit('clear-canvas', roomName);
  clearCanvas();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

toggleBtn.addEventListener('click', () => {
  isEraser = !isEraser;
  toggleBtn.textContent = isEraser ? 'Lápis' : 'Borracha';
});

socket.on('draw', ({ from, to, color }) => {
  drawLine(from, to, color);
});
socket.on('clear-canvas', () => {
  clearCanvas();
});
