// Create our 'main' state that will contain the game
var mainState = {
    preload: function () {
        window.saveUser = false;
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
        game.load.audio('bg', 'assets/bg.mp3');

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

        this.bg = game.add.audio('bg');
        this.bg.volume = 0.4;
        this.bg.loopFull();


        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        this.sky = game.add.sprite(0, 0, 'sky');
        this.sky.height = game.height;
        this.sky.width = game.width;

        this.bestScore = localStorage && localStorage.getItem('bestScore') ? localStorage.getItem('bestScore') : "0";

        // Create a label to use as a button
        button = game.add.button(width / 2, height / 2, 'button', this.actionOnClick, this);
        button.anchor.set(0.5);
        button.scale.setTo(0.5);

        var text = "best score: " + this.bestScore;
        game.add.text(20, height - 50, text, {font: "15px arcade", fill: "red"});

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
        document.getElementById("inputWrp").style.display = "none";
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
        this.bg.stop();
        this.gameStarted = false;
        document.getElementById("leaderboard").style.display = "block";
        // Start the 'main' state, which restarts the game
        game.state.start('main');

        if (window.scoreList) {
            if (window.scoreList[window.scoreList.length - 1].value < this.score) {
                document.getElementById("inputWrp").style.display = "block";
                insertUser(this.score);
            }
        } else {
            document.getElementById("inputWrp").style.display = "block";
            insertUser(this.score);
        }

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
};

var game = [];
var height, width;
var init = false;


function initGame() {
    if (init) {
        return;
    }
    init = true;
    console.log('init');
    // Initialize Phaser, and create a 400px by 490px game
    game = new Phaser.Game(width, height, Phaser.CANVAS);

    // Add the 'mainState' and call it 'main'
    game.state.add('main', mainState);

    // Start the state to actually start the game
    game.state.start('main');
}

window.mobileAndTabletcheck = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

if (window.mobileAndTabletcheck()) {
    initOnLandscape();

    var clear = setInterval(function () {
        initOnLandscape();
    }, 200);
} else {
    //initGame();
    document.getElementsByTagName('body')[0].innerHTML = '<p> support on mobile only</p>';
    document.getElementsByTagName('body')[0].style.color = 'black';
    document.getElementsByTagName('body')[0].style.textAlign = 'center';
    document.getElementsByTagName('body')[0].style.paddingTop = '25px';
}

function initOnLandscape() {
    width = document.body.offsetWidth;
    height = document.body.offsetHeight;

    if (height > width) {
        document.getElementById("turn").style.display = "none";
        clearInterval(clear);
        initGame();
    } else {
        document.getElementById("turn").style.display = "block";
    }
}


