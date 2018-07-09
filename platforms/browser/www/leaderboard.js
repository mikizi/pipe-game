App42.initialize("c5a3f6c200fb7247d60323c9e8ed1fa82236c0b08676278c3cdd4db5e631763a",
    "a2052fb4c90444f77aaee12e6c6b0040ec8e076ba5c885ef0bb4f8c267de7a91");


var scoreBoardService = new App42ScoreBoard();


var gameName = "jumpi-test-2",
    result,
    max = 5;

    window.saveUser = false;

saveUserScore = function (userName, score) {
    if(score) {
        scoreBoardService.saveUserScore(gameName, userName, score, {
            success: function () {
                updateScoreBoard();
            },
            error: function (error) {
            }
        });
    }
};

updateScoreBoard = function () {

    scoreBoardService.getTopNRankers(gameName, max, {
        success: function (object) {
            var game = JSON.parse(object);
            result = game.app42.response.games.game;

            console.log("gameName is : " + result.name);
            window.scoreList = result.scores.score;
            var dataTable = '';
            if (scoreList instanceof Array) {
                for (var i = 0; i < scoreList.length; i++) {
                    dataTable += createRow(scoreList[i].userName , scoreList[i].value.toString());
                }
            }else if(scoreList !== undefined){
                dataTable += createRow(scoreList.userName , scoreList.value.toString());
            }else{
                return;
            }

            document.getElementById("tblWrp").innerHTML = "<table width = \"100%\"><tr><td class='headTbl' colspan = \"2\"><strong>TOP SCORES</strong></td>" + dataTable + "</table>";
            document.getElementById("leaderboard").style.display = 'block';
        }, error: function (error) {
            alert(error.toString());
        }
    });
};

createRow = function(userName  , value ){
    return  "<tr>" +
        "<td align = \"left\">" + userName + "</td>" +
        "<td align = \"right\">" + value + "</td>" +
        "</tr>";
};

insertUser = function (score) {


    var clear = setInterval(function (score) {
        var x = document.getElementById("usrname");
        if (x.value.length === 3 && !saveUser) {
            saveUser = true;
            clearInterval(clear);
            console.log('fin');
            saveUserScore(x.value, score);
            document.getElementById("inputWrp").style.display = 'none';
        }
    }, 100, score);
};