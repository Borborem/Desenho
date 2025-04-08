const opacitySlider = document.getElementById('opacitySlider');
const lineWidthSlider = document.getElementById('lineWidth');
const socket = io();
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const toggleBtn = document.getElementById('toggleTool');
const clearBtn = document.getElementById('clearCanvas');
const userListEl = document.getElementById('userList');

let userName = '';
let roomName = '';
let drawing = false;
let prev = null;
let drawingUser = null;
let showUserTimeout = null;
let isEraser = false;

document.getElementById('joinBtn').addEventListener('click', () => {
  userName = document.getElementById('nameInput').value || 'Anônimo';
  roomName = document.getElementById('roomInput').value || 'geral';
  document.getElementById('loginScreen').style.display = 'none';

  socket.emit('join-room', { user: userName, room: roomName });

});

socket.on('draw', ({ from, to, color, isEraser, user }) => {
  drawLine(from, to, isEraser ? '#ffffff' : color, user);
  drawingUser = { name: user, position: to };
  if (showUserTimeout) clearTimeout(showUserTimeout);
  showUserTimeout = setTimeout(() => { drawingUser = null; }, 500);
});

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  prev = { x: e.clientX, y: e.clientY }; // Inicializa o ponto inicial
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  prev = null; // Reseta o ponto anterior ao soltar o mouse
});
canvas.addEventListener('mousemove', (e) => {
  if (!drawing || !prev) return;

  const curr = { x: e.clientX, y: e.clientY };
  const color = isEraser ? '#ffffff' : colorPicker.value;
 // drawDot({ x: e.clientX, y: e.clientY }, isEraser ? '#ffffff' : colorPicker.value);
  drawLine(prev, curr, color); // Desenha a linha ou drawDot
  socket.emit('draw', { from: prev, to: curr, color, isEraser, user: userName, room: roomName });
  prev = curr; // Atualiza o ponto anterior
});


function drawDot(point, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha = parseFloat(opacitySlider.value);
  ctx.beginPath();
  ctx.arc(point.x, point.y, parseInt(lineWidthSlider.value) / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

function drawLine(from, to, color, user) {
  ctx.strokeStyle = color;
//ctx.lineWidth = 2;
  ctx.lineWidth = parseInt(lineWidthSlider.value); // 👈 usa o valor do slider
  ctx.globalAlpha = parseFloat(opacitySlider.value); // 👈 controla opacidade

  ctx.lineCap = 'round';//smooth
  ctx.lineJoin = 'round';//smooth

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.globalAlpha = 1.0; // 🔁 resetar depois do traço

}

// function drawLine(from, to, color, user) {
//   const mid = {
//     x: (from.x + to.x) / 2,
//     y: (from.y + to.y) / 2
//   };

//   ctx.strokeStyle = color;
//   ctx.lineWidth = parseInt(lineWidthSlider.value);
//   ctx.globalAlpha = parseFloat(opacitySlider.value);
//   ctx.lineCap = 'round';
//   ctx.lineJoin = 'round';

//   ctx.beginPath();
//   ctx.moveTo(from.x, from.y);
//   ctx.quadraticCurveTo(from.x, from.y, mid.x, mid.y);
//   ctx.stroke();

//   ctx.globalAlpha = 1.0;
// }


clearBtn.addEventListener('click', () => {
  socket.emit('clear-canvas', roomName);
  clearCanvas();
});

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

socket.on('clear-canvas', () => { clearCanvas(); });


toggleBtn.addEventListener('click', () => {
  isEraser = !isEraser;
  toggleBtn.textContent = isEraser ? 'Lápis' : 'Borracha';
});

