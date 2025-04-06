
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
  drawLine(prev, curr, color); // Desenha a linha
  socket.emit('draw', { from: prev, to: curr, color, isEraser, user: userName, room: roomName });
  prev = curr; // Atualiza o ponto anterior
});

function drawLine(from, to, color, user) {
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

socket.on('clear-canvas', () => { clearCanvas(); });


toggleBtn.addEventListener('click', () => {
  isEraser = !isEraser;
  toggleBtn.textContent = isEraser ? 'Lápis' : 'Borracha';
});

