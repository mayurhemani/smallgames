var gameTime = 60;
var gameSpeed = 1000;
var wordSize = 4;

String.prototype.replaceAt = function(idx, c) {
    return this.substr(0, idx) + c + this.substr(idx + 1);
};

function scorer_t() {
	this.score = 0;
	this.disp = document.getElementById("score");
	this.go = document.getElementById("gameOver");
}
scorer_t.prototype.reset = function(val) {
	this.score = val;
	this.disp.innerHTML = val.toString();
	this.go.innerHTML = "";
	this.go.className = "";
};
scorer_t.prototype.step = function() {
	this.score--;
	this.disp.innerHTML = this.score.toString();
};

scorer_t.prototype.finish = function() {
	var ts = document.getElementById("totalScore");
	var cur = parseInt(ts.innerHTML);
	cur += this.score;
	ts.innerHTML = cur;
	board.finish();
};

scorer_t.prototype.gameOver = function() {
	this.go.className = "alert alert-danger";
	this.go.innerHTML = "You Lose!";
	this.finish();
};

scorer_t.prototype.gameWon = function() {
	this.go.className = "alert alert-success";
	this.go.innerHTML = "You Win!";
	this.finish();
};

function words_db() {
	this.words = [];
	var mthis = this;
	$.get("/words/word" + wordSize + ".txt").then(function(url, flag, data) {
		mthis.words = data.responseText.split("\n");
		console.log(mthis.words);
	});

	this.divs = [];

	for (var i = 0; i < wordSize; ++i) {
		this.divs.push( document.getElementById("gameContainer").appendChild(
				document.createElement("div")) );
		this.divs[i].contentEditable = true;
		this.divs[i].className = "letter";
	}
}
words_db.prototype.getWord = function() {
	var r = parseInt(Math.random() * this.words.length);
	if (r == this.words.length) {
		r = this.words.length - 1;
	}
	return this.words[r];
};


var words = new words_db();

function jumble(word) {
	var times = 2 + parseInt(10 * Math.random());
	console.log(times);
	for (var i = 0; i < times; ++i) {
		var idx1 = parseInt(100 * Math.random()) % wordSize ;
		var idx2 = i % wordSize;

		var c = word[idx1];
		var d = word[idx2];

		word = word.replaceAt(idx2, c);
		word = word.replaceAt(idx1, d);
	}
	return word;
}


function word_jumble_t() {
	this.divs = words.divs;
	for (var i = 0; i < this.divs.length; ++i) {
		this.divs[i].innerHTML = "";
	}

	this.currentWord = words.getWord();

	document.getElementById("jumbledWord").innerHTML = jumble(this.currentWord);
}

word_jumble_t.prototype.isWon = function() {
	var wrd = "";
	for (var i = 0; i < this.divs.length; ++i) {
		wrd += this.divs[i].innerHTML;
	}
	return (wrd == this.currentWord);
};


function game_t() {
	this.logic = null;
	this.scorer = new scorer_t();
	this.timer = null;
}

game_t.prototype.newGame = function() {
	this.logic = new word_jumble_t();
	this.scorer.reset(gameTime);
	var mthis = this;
	var step = function() {
		if (!mthis.logic.isWon()) {
			if (mthis.scorer.score > 0) {
				mthis.scorer.step();
			} else {
				mthis.scorer.gameOver();
				clearInterval(mthis.timer);
			}
		} else {
			mthis.scorer.gameWon();
			clearInterval(mthis.timer);
		}
	};

	this.timer = setInterval(step, gameSpeed);
};


var game = new game_t();

var board = {
	newgame: function() {
		document.getElementById("newGameBtn").class = "btn btn-primary fun btn-disabled";
		document.getElementById("actualWord").innerHTML = "";
		game.newGame();
	},
	finish: function() {
		document.getElementById("newGameBtn").class = "btn btn-primary fun";
		document.getElementById("actualWord").innerHTML = game.logic.currentWord;
	}
};