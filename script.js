const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");

// Imagens (PNG com transparência)
const birdImg = new Image();
birdImg.src = "cocrodilo.png";

const pipeTopImg = new Image();
pipeTopImg.src = "pipe_top.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "pipe_bottom.png";

// Habilita o botão START somente quando todas as imagens carregarem
let imagensCarregadas = 0;
const totalImagens = 3;
startBtn.disabled = true;

function imagemCarregada() {
    imagensCarregadas++;
    if (imagensCarregadas === totalImagens) {
        startBtn.disabled = false;
    }
}

birdImg.onload = imagemCarregada;
pipeTopImg.onload = imagemCarregada;
pipeBottomImg.onload = imagemCarregada;

// Estado do jogo
let birdY, birdX, gravity, velocity, jump, pipes, score, gameOver;
let jogoRodando = false;
let animacaoId = null;
let pipeIntervalId = null; // para limpar o setInterval ao reiniciar

function resetarVariaveis() {
    birdY = 200;
    birdX = 50;
    gravity = 0.1;
    velocity = 0.5;
    jump = -3.5;
    pipes = [];
    score = 0;
    gameOver = false;
}

// Criar obstáculos
function criarCano() {
    const altura = Math.floor(Math.random() * 200) + 100;
    pipes.push({
        x: canvas.width,
        height: altura,
        width: 60,
        gap: 160
    });
}

// Colisão (AABB simples)
function colisao(cano) {
    return (
        (birdX + 30 > cano.x &&
            birdX < cano.x + cano.width &&
            (birdY < cano.height || birdY + 30 > cano.height + cano.gap)) ||
        birdY + 30 >= canvas.height ||
        birdY < 0
    );
}

// Desenhar jogo
function desenhar() {
    if (gameOver) {
        cancelAnimationFrame(animacaoId);
        if (pipeIntervalId) {
            clearInterval(pipeIntervalId);
            pipeIntervalId = null;
        }
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Fim de jogo!", 110, 300);
        ctx.fillText("Pontuação: " + score, 120, 350);
        startBtn.style.display = "inline-block";
        return;
    }

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Física do pássaro
    velocity += gravity;
    birdY += velocity;

    // Desenha pássaro
    ctx.drawImage(birdImg, birdX, birdY, 100, 70);

    // Canos
    pipes.forEach((p) => {
        p.x -= 2;

        // Cano de cima
        ctx.drawImage(pipeTopImg, p.x, 0, p.width, p.height);

        // Cano de baixo
        const bottomY = p.height + p.gap;
        const bottomHeight = canvas.height - bottomY;
        ctx.drawImage(pipeBottomImg, p.x, bottomY, p.width, bottomHeight);

        if (colisao(p)) {
            gameOver = true;
        }

        // Pontuação
        if (p.x + p.width === birdX) score++;
    });

    // Remove canos antigos
    if (pipes.length && pipes[0].x + pipes[0].width < 0) pipes.shift();

    // Pontuação na tela
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Pontuação: " + score, 10, 30);

    animacaoId = requestAnimationFrame(desenhar);
}

// Pulo
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && jogoRodando && !gameOver) {
        velocity = jump;
    }
});

// Começar jogo com contagem
startBtn.addEventListener("click", () => {
    if (startBtn.disabled) return;
    startBtn.style.display = "none";
    countdownEl.textContent = "3";
    let contagem = 3;

    const intervalo = setInterval(() => {
        contagem--;
        if (contagem > 0) {
            countdownEl.textContent = contagem;
        } else {
            clearInterval(intervalo);
            countdownEl.textContent = "";
            iniciarJogo();
        }
    }, 1000);
});

function iniciarJogo() {
    // limpa intervalos/animacao anteriores, se houver
    if (pipeIntervalId) {
        clearInterval(pipeIntervalId);
        pipeIntervalId = null;
    }
    if (animacaoId) {
        cancelAnimationFrame(animacaoId);
        animacaoId = null;
    }
    resetarVariaveis();
    jogoRodando = true;
    pipes = [];
    criarCano();

    pipeIntervalId = setInterval(() => {
        if (!gameOver) criarCano();
    }, 2000);

    desenhar();
}
