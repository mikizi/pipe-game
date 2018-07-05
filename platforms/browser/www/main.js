// Create our 'main' state that will contain the game
var mainState = {
        preload: function () {
            updateScoreBoard();
            // This function will be executed at the beginning
            // That's where we load the images and sounds
            game.load.image('sky', 'assets/sky.png');
            game.load.spritesheet('bird', 'assets/hero.png', 182, 175, 14);
            game.load.image('button', 'assets/start_btn.png');

            game.load.image('pipe1', 'assets/pipe.png');
            game.load.image('pipe2', 'assets/bird.png');

            game.load.audio('jump', 'assets/jump.mp3');
            game.load.audio('gameOver', 'assets/game_over.mp3');
            game.load.audio('gameStart', 'assets/startGame.mp3');

            game.scale.forceOrientation(false, true);
            game.scale.enterIncorrectOrientation.add(this.handleIncorrect);
            game.scale.leaveIncorrectOrientation.add(this.handleCorrect);
        },

        handleIncorrect: function () {
            if (!game.device.desktop) {
                document.getElementById("turn").style.display = "block";
                game.paused = true;
            }
        },

        handleCorrect: function () {
            if (!game.device.desktop) {
                document.getElementById("turn").style.display = "none";
                game.paused = false;
            }
        },

        render: function () {
            /* // Input debug info
             game.debug.inputInfo(32, 32);
             //game.debug.spriteInputInfo(sprite, 32, 130);
             game.debug.pointer( game.input.activePointer );
             this.game.debug.text(`Debugging Phaser ${Phaser.VERSION}`, 20, 20, 'yellow', 'Segoe UI');*/

        },

        create: function () {

            // Set the physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

            //  A simple background for our game
            this.sky = game.add.sprite(0, 0, 'sky');
            this.sky.height = game.height;
            this.sky.width = game.width;

            this.bestScore = localStorage && localStorage.getItem('bestScore') ? localStorage.getItem('bestScore') : "0";

            var text = "best score: " + this.bestScore;
            game.add.text(20, height - 50, text, {font: "15px arcade", fill: "red"});

            // Create a label to use as a button
            button = game.add.button(width / 2, height / 2, 'button', this.actionOnClick, this);
            button.anchor.set(0.5);
            button.scale.setTo(0.5);

        },

        update: function () {
            if (!this.gameStarted) {
                return;
            }
            // If the bird is out of the screen (too high or too low)
            // Call the 'restartGame' function
            if (this.bird.y < 0 || this.bird.y > height) {
                if (this.bird.alive)
                    this.gameOverSound.play();

                this.restartGame();
            }

            game.physics.arcade.overlap(
                this.bird, this.pipes, this.hitPipe, null, this);

            if (this.bird.angle < 20)
                this.bird.angle += 1;
        },

        Difficulty: {
            easy: {
                holes: 4,
                speed: 3000,
            },
            medium: {
                holes: 3,
                speed: 2800,
            },
            hard: {
                holes: 3,
                speed: 2000,
            },
            veryHard: {
                holes: 2,
                speed: 1500,
            },
        },

        actionOnClick: function () {
            this.startGame();
        },

        startGame: function () {
            this.initGame(game);
            document.getElementById("leaderboard").style.display = "none";
            //game.add.tween(button).to({alpha: 0}, 200, Phaser.Easing.Linear.None, true);
            button.destroy();
            this.gameStarted = true;
            this.startGameSound = game.add.audio('gameStart');
            this.startGameSound.play();
        },

        initGame: function () {

            var level = this.setDifficulty();

            this.createBird(game);
            this.timer = game.time.events.loop(level.speed, this.addRowOfPipes, this);

            // Create a label to use as a button
            this.pause_label = game.add.text(width - 100, 20, 'Pause', {font: '15px arcade', fill: '#fff'});
            this.pause_label.inputEnabled = true;
            this.pause_label.events.onInputUp.add(function () {
                // When the paus button is pressed, we pause the game
                game.paused = true;
                this.pause_label.setText('Resume');
            }.bind(this));

            // Create an empty group
            this.pipes = game.add.group();

            // Call the 'jump' function when the spacekey is hit
            var spaceKey = game.input.keyboard.addKey(
                Phaser.Keyboard.SPACEBAR
            );

            this.score = 0;
            this.labelScore = game.add.text(20, 20, "0",
                {font: "15px arcade", fill: "#ffffff"});

            game.input.onDown.add(this.jump, this);
            spaceKey.onDown.add(this.jump, this);

            // Add a input listener that can help us return from being paused
            spaceKey.onDown.add(this.unpause, this);
            game.input.onDown.add(this.unpause, this);

            this.jumpSound = game.add.audio('jump');
            this.jumpSound.volume = 0.1;

            this.gameOverSound = game.add.audio('gameOver');
        },

        createBird: function (game) {

            // Display the bird at the start position
            this.bird = game.add.sprite(20, 245, 'bird', 3);
            this.bird.scale.set(0.3);
            anim = this.bird.animations.add('walk');
            anim.play(50, true);

            // Add physics to the bird
            // Needed for: movements, gravity, collisions, etc.
            game.physics.arcade.enable(this.bird);

            // Add gravity to the bird to make it fall
            this.bird.body.gravity.y = 1000;

            // Move the anchor to the left and downward
            this.bird.anchor.setTo(-0.2, 0.5);
        },

        setDifficulty: function () {
            switch (true) {
                case (this.score < 10):
                    return this.Difficulty.easy;
                case (this.score < 20):
                    return this.Difficulty.medium;
                case (this.score < 50):
                    return this.Difficulty.hard;
                default:
                    return this.Difficulty.veryHard;
            }
        },

        hitPipe: function () {
            // If the bird has already hit a pipe, do nothing
            // It means the bird is already falling off the screen
            if (this.bird.alive === false)
                return;

            // Set the alive property of the bird to false
            this.bird.alive = false;

            // Prevent new pipes from appearing
            game.time.events.remove(this.timer);

            if (this.score > this.bestScore)
                localStorage.setItem('bestScore', this.score);

            // Go through all the pipes, and stop their movement
            this.pipes.forEach(function (p) {
                p.body.velocity.x = 0;
            }, this);

            this.gameOverSound.play();
        },

        unpause: function () {
            game.paused = false;
            this.pause_label.setText('Pause');
        },

        // Make the bird jump
        jump: function () {

            if (this.bird.alive == false)
                return;

            // Add a vertical velocity to the bird
            this.bird.body.velocity.y = -300;

            game.add.tween(this.bird).to({angle: -20}, 100).start();

            this.jumpSound.play();
        },

        // Restart the game
        restartGame: function () {
            this.gameStarted = false;
            document.getElementById("leaderboard").style.display = "block";
            // Start the 'main' state, which restarts the game
            game.state.start('main');

            saveUserScore(this.score);

        },

        addOnePipe: function (x, y) {
            // Create a pipe at the position x and y
            var pipe = game.add.sprite(x, y, 'pipe' + game.rnd.integerInRange(1, 2));

            // Add the pipe to our previously created group
            this.pipes.add(pipe);

            // Enable physics on the pipe
            game.physics.arcade.enable(pipe);

            // Add velocity to the pipe to make it move left
            pipe.body.velocity.x = -250;

            // Automatically kill the pipe when it's no longer visible
            pipe.checkWorldBounds = true;
            pipe.outOfBoundsKill = true;

            this.labelScore.text = this.score;
        },

        addRowOfPipes: function () {
            // Randomly pick a number between 1 and 5
            // This will be the hole position
            this.score += 1;

            var amount = Math.floor(height / 50) + 1;

            var hole = game.rnd.integerInRange(1, amount - 4);


            // Add the 6 pipes
            // With one big hole at position 'hole' and 'hole + 1'
            for (var i = 0; i < amount; i++)
                if (i != hole && i != hole + 1 && i != hole + 2)
                    this.addOnePipe(width, i * 50);
        },

        gameStarted: false
    }
;

var clear = setInterval(function () {
    initOnLandscape();
}, 200);

var game = [];
var height, width;
var init = false;

initOnLandscape();

function initOnLandscape() {
    width = document.body.offsetWidth;
    height = document.body.offsetHeight;

    if (height > width) {
        document.getElementById("turn").style.display = "none";
        clearInterval(clear);
        if (init) {
            return;
        }
        init = true;
        console.log('init')
        // Initialize Phaser, and create a 400px by 490px game
        game = new Phaser.Game(width, height, Phaser.CANVAS);

        // Add the 'mainState' and call it 'main'
        game.state.add('main', mainState);

        // Start the state to actually start the game
        game.state.start('main');
    } else {
        document.getElementById("turn").style.display = "block";
    }
}
