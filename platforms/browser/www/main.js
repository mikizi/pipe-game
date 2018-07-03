// Create our 'main' state that will contain the game
var mainState = {
    preload: function () {
        // This function will be executed at the beginning
        // That's where we load the images and sounds
        game.load.image('sky', 'assets/sky.png');
        game.load.spritesheet('bird', 'assets/hero.png',182,175,14);//56
        game.load.image('pipe1', 'assets/pipe.png');
        game.load.image('pipe2', 'assets/bird.png');

        game.load.audio('jump', 'assets/fly.mp3');
        game.load.audio('gameOver', 'assets/game_over.mp3');

    },

    create: function () {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        this.sky =game.add.sprite(0, 0, 'sky');
        this.sky.height = game.height;
        this.sky.width = game.width;

            // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'bird',3);
        this.bird.scale.set(0.3);
        anim = this.bird.animations.add('walk');
        anim.play(50,true);
        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;

        // Create an empty group
        this.pipes = game.add.group();

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR
        );

        game.input.onDown.add(this.jump, this);

        this.jumpSound = game.add.audio('jump');
        this.gameOverSound = game.add.audio('gameOver');

        spaceKey.onDown.add(this.jump, this);

        this.timer = game.time.events.loop(2500, this.addRowOfPipes, this);

        this.score = 0;
        this.bestScore = localStorage ? localStorage.getItem('bestScore') : "best score: 0";

        this.labelScore = game.add.text(20, 20, "0",
            {font: "25px Arial", fill: "#ffffff"});

        this.bestScore = game.add.text(20, height-50, this.bestScore,
            {font: "25px Arial", fill: "red"});

        // Move the anchor to the left and downward
        this.bird.anchor.setTo(-0.2, 0.5);

        // Create a label to use as a button
        this.pause_label = game.add.text(width -100,  height -50, 'Pause', { font: '24px Arial', fill: '#fff' });
        this.pause_label.inputEnabled = true;
        this.pause_label.events.onInputUp.add(function () {
            // When the paus button is pressed, we pause the game
            game.paused = true;
            this.pause_label.setText('Resume Game');
        }.bind(this));

        // Add a input listener that can help us return from being paused
        spaceKey.onDown.add(this.unpause, this);
        game.input.onDown.add(this.unpause, this);
    },

    update: function () {
        // If the bird is out of the screen (too high or too low)
        // Call the 'restartGame' function
        /*    if (this.bird.y < 0 || this.bird.y > 490)
                this.restartGame();*/
        if (this.bird.alive === true){
            if (this.bird.y < 0)
                this.bird.y = 0;

            if (this.bird.y > height-40) {
                this.bird.y = height-40;
                game.add.tween(this.bird).to({angle: -20}, 100).start();
            } /*else {
                this.bird.body.gravity.y = 1000;
            }*/
        }else{
            this.hitPipe();
            if (this.bird.y < 0 || this.bird.y > height)
                this.restartGame();
        }

        game.physics.arcade.overlap(
            this.bird, this.pipes, this.hitPipe, null, this);

        if (this.bird.angle < 20)
            this.bird.angle += 1;
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive === false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        this.gameOverSound.play();

        localStorage.setItem('bestScore', "best score: " + this.score);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    unpause: function(){
        game.paused = false;
        this.pause_label.setText('Pause');
    },

    // Make the bird jump
    jump: function () {

        if (this.bird.alive == false)
            return;

        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;

        game.add.tween(this.bird).to({angle: -20}, 100).start();

        this.jumpSound.play();
    },

    // Restart the game
    restartGame: function () {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
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
        this.score +=  1;

        var amount = Math.floor(height/ 50) +1;

        var hole = game.rnd.integerInRange(1, amount-4);


        // Add the 6 pipes
        // With one big hole at position 'hole' and 'hole + 1'
        for (var i = 0; i < amount; i++)
            if (i != hole && i != hole + 1 && i != hole + 2)
                this.addOnePipe(width, i * 50);
    },
};

var width = window.innerWidth;
var height = window.innerHeight;
console.log('size' ,width,height);

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(width,height );

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
