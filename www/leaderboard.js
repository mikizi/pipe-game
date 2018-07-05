App42.initialize("c5a3f6c200fb7247d60323c9e8ed1fa82236c0b08676278c3cdd4db5e631763a",
    "a2052fb4c90444f77aaee12e6c6b0040ec8e076ba5c885ef0bb4f8c267de7a91");


var scoreBoardService = new App42ScoreBoard();


var gameName = "jumpi-test1",
    result,
    max = 5;

saveUserScore = function (userName, score) {
    scoreBoardService.saveUserScore(gameName, userName, score, {
        success: function () {
            updateScoreBoard();
        },
        error: function (error) {
        }
    });
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
                    dataTable += "<tr>" +
                        "<td align = \"left\">" + scoreList[i].userName + "</td>" +
                        "<td align = \"right\">" + scoreList[i].value.toString() + "</td>" +
                        "</tr>";
                }
            }
            document.getElementById("tblWrp").innerHTML = "<table width = \"100%\"><tr><td class='headTbl' colspan = \"2\"><strong>TOP SCORES</strong></td>" + dataTable + "</table>";
        }, error: function (error) {
        }
    });
};

insertUser = function () {
    var clear = setInterval(function () {
        score = 5;
        var x = document.getElementById("usrname");
        if (x.value.length === 3) {
            saveUserScore(x.value, score);
            clearInterval(clear);
            document.getElementById("inputWrp").style.display = 'none';

        }
    }, 100)
};