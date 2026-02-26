
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>NEON DREAD: SURFER</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container">
        <canvas id="gameCanvas"></canvas>
       
        <div id="main-menu" class="overlay">
            <h1 class="title">NEON<span>DREAD</span></h1>
            <button class="menu-btn" onclick="startGame()">START RUN</button>
            <div class="highscore">BEST: <span id="best-score">0</span></div>
        </div>

        <div id="hud" class="hidden">
            <div class="score-box">SCORE: <span id="current-score">0</span></div>
        </div>

        <div id="death-screen" class="overlay hidden">
            <h2 class="death-msg">WASTED</h2>
            <button class="menu-btn" onclick="resetGame()">TRY AGAIN</button>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>
