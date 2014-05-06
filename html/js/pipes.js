
var gameOptionsManager = {
	fillSpeed : 1500,
	outOfPlayAreaKills : true,
	additiveMode : false,
	godMode : false,
	selectedPipeValue : [1, 1, 1, 0], //null
	topLeftPipe : null
}

var Node = function(connections, connectionStatus) {
	var defaults = {
		connections : [null, null, null, null],
		connectionStatus : [0, 0, 0, 0]
	};
	this._connections = connections || defaults.connections;
	this._connectionStatus = connectionStatus || defaults.connectionStatus;
	this.proxy = $({});
	
	Node.nodes.push(this);

}

Node.nodes = [];
Node.removeAll = function(){
	for( var i = 0; i < Node.nodes.length;i++){
		Node.nodes[i] = null;
	}
	Node.nodes = [];
}
Node.pauseAll = function(){
	
	for( var i = 0; i < Node.nodes.length;i++){
		Node.nodes[i].pause();
	}
	
}
Node.unpauseAll = function(){
	for( var i = 0; i < Node.nodes.length;i++){
		Node.nodes[i].unpause();
	}
}
	

Node.prototype.setConnection = function(connectionIndex, connectionNode) {
	if (connectionIndex < this._connections.length) {
		this._connections[connectionIndex] = connectionNode;
	}
}

Node.prototype.setConnectionStatusList = function(connectionStatus) {
	this._connectionStatus = null;
	this._connectionStatus = connectionStatus;

}

Node.prototype.on = function(evt, callback){
	this.proxy.on(evt, callback);
}
var Pipe = Node.prototype.constructor;

Pipe.prototype = new Node();
Pipe.prototype.full = 0;

Pipe.prototype.pause = function(){
	this._htmlElement.find(".water").pause();
	this._htmlElement.find(".water2").pause();
}
Pipe.prototype.unpause = function(){
	this._htmlElement.find(".water").resume();
	this._htmlElement.find(".water2").resume();
}
Pipe.prototype.fill = function(startConnectionIndex) {
	if ( typeof startConnectionIndex != 'undefined' && (this.full != this._connectionStatus[startConnectionIndex] || this.full == 0)) {
		
		var waterLayer = "";
		
		if(this._connectionStatus[startConnectionIndex] == 2){
			waterLayer = "2";
		}
		if (startConnectionIndex == 1) {
			this._htmlElement.find(".water"+waterLayer).addClass("right");
		} else if (startConnectionIndex == 0) {
			this._htmlElement.find(".water"+waterLayer).addClass("verticle");
		} else if (startConnectionIndex == 2) {
			this._htmlElement.find(".water"+waterLayer).addClass("verticle").addClass("bottom");
		}

		if (this._connectionStatus[startConnectionIndex] > 0) {

			var pipeLine = this._connectionStatus[startConnectionIndex];
			this.full = pipeLine;
			var thispipe = this;

			var animationOptions = {
				width : "71px"
			};
			
			if (startConnectionIndex == 0) {
				animationOptions = {
					'height' : "71px"
				};
			} else if (startConnectionIndex == 2) {
				animationOptions = {
					'margin-top' : "-71px"
				};

			}

			thispipe._htmlElement.find(".water"+waterLayer).animate(animationOptions, gameOptionsManager.fillSpeed, function() {
			thispipe._htmlElement.addClass("full");
			if(waterLayer == 2){
				thispipe._htmlElement.addClass("full2");
			}
			
			for (var i = 0; i < thispipe._connectionStatus.length; i++) {
					var from = 0;
					if (i == 0) {
						from = 2;
					} else if (i == 1) {
						from = 3;
					} else if (i == 2) {
						from = 0;
					} else if (i == 3) {
						from = 1;
					}

					if (thispipe._connectionStatus[i] == pipeLine  && i != startConnectionIndex) {
						if (thispipe._connections[i] != null && typeof thispipe._connections[i] != 'undefined') {
							thispipe.proxy.trigger("full");
							thispipe._connections[i].fill(from);
						} else if (gameOptionsManager.outOfPlayAreaKills) {
							gameOptionsManager.fillSpeed = 100;
						}
					}
				}
			});
		} else {
			gameOptionsManager.fillSpeed = 100;
		}
	}
}
Pipe.prototype.setHTMLElement = function(element) {
	this._htmlElement = element;
}

Pipe.prototype.setConnectionStatusList = function(connectionStatus) {
	var pipeOptions = [[0, 1, 0, 1], [0, 0, 1, 1], [0, 1, 1, 0], [1, 1, 0, 0], [1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 0], [1, 1, 1, 0]];

	if (connectionStatus != null && typeof connectionStatus != 'undefined') {
		this._connectionStatus = null;
		this._connectionStatus = connectionStatus;
	} else {
		var random = Math.floor(Math.random() * pipeOptions.length);
		this._connectionStatus = null;
		this._connectionStatus = pipeOptions[random];
	}

	if (this._htmlElement != null && typeof this._htmlElement != 'undefined') {
		var newclass = this._connectionStatus.toString().replace(/,/g, "");
		this._htmlElement.find("span").removeClass().addClass("pipe-" + newclass);
	}

}

var PipeGame = (function() {
	var _numCols = 8;
	var _numRows = 4;
	var _firstx = 0;
	var _firsty = 0;
	var _lastx = 3;
	var _lasty = 0;
	var _lastToFill;
	var _firstToFill;
	var _score = 0;
	var _scoreMultiplier = 1;
	var _numberOfPipesFilled = 0;
	var _fillSpeed = 3000;
	var _startTimer;
	var _autoStart = null;
	var _displayTimer = null;
	var _paused = false;
	var _eventsAdded = false;
    var _pipeLevel = [[[0,0,1,1],[1,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
        [[0,0,0,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]],
        [[0,0,0,0],[0,0,0,0],[0,0,1,1],[1,0,0,1],[0,0,1,1],[1,1,0,0]],
        [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,0,1]]];

	function _configure(options) {
		_numCols = options.cols;
		_numRows = options.rows;
		_firstx = options.startX;
		_firsty = options.StartY;
		_lastx = options.lastX;
		_lasty = options.lastY;
		_autoStart = options.autoStart || null;
        gameOptionsManager.godMode = options.godMode || false;
		gameOptionsManager.additiveMode = options.additiveMode || false;
        _pipeLevel = options.level;
	}

	function _setGameBoard(level) {
		var prevTopNode;
		var prevCol = [];
		var topNode;
		var random;
		var pipeclasst;
		var pipeclass;
		var nodeAbove;
		var bottomNode;

		_lastToFill = null;
	    _firstToFill = null;
		_paused = false;
		_score  = 0;
		_scoreMultiplier = 1;
		_displayTimer = null;
		_startTimer = null;
		Node.removeAll();
		
		gameOptionsManager.fillSpeed = 1500;
		$(".plumbing").html("");


		for (var i = 0; i < _numCols; i++) {

			$(".plumbing").append("<ul class=\"col-" + i + "\"></ul>");
			nodeAbove = null;

			for (var j = 0; j < _numRows; j++) {

				bottomNode = new Pipe();
				
				if (i == 0 && j == 0) {
					gameOptionsManager.topLeftPipe = bottomNode;
				}

				if ( typeof level != 'undefined') {
					bottomNode.setConnectionStatusList(level[i][j]);
				} else {
					bottomNode.setConnectionStatusList();
				}

				pipeclass = "pipe-" + bottomNode._connectionStatus.toString().replace(/,/g, "");
				bottomNode.setHTMLElement($(".plumbing .col-" + i).append("<li class=\"row-" + j + "\"><span class=\"" + pipeclass + "\"></span><div class=\"water2-background\"></div><div class=\"water\"></div><div class=\"water2\"></div></li>").find("li").last());

				if (nodeAbove != null && typeof nodeAbove != 'undefined') {
					bottomNode.setConnection(0, nodeAbove);
					nodeAbove.setConnection(2, bottomNode);
				}

				if (i > 0) {
					bottomNode.setConnection(3, prevCol[j]);
					prevCol[j].setConnection(1, bottomNode);
				}

				if (i == _firstx && j == _firsty) {
					_firstToFill = bottomNode;
				}

				if (i == _lastx && j == _lasty) {
					_lastToFill = bottomNode;
				}

				prevCol[j] = bottomNode;
				nodeAbove = bottomNode;

			}

			prevTopNode = topNode;
		}

		_displayTimer = null;
		
		if(!_eventsAdded){
			_eventsAdded = true;
			_addButtonEvents();
		}
	}

	function _addButtonEvents() {
		$(".start").click(function() {
            PipeGame.setGameBoard(PipeGame.pipeLevel);
		});

		$(".menu-button").click(function() {
            /*$('.water')
                .animate({opacity: 0.3}, 2000, function() {
                    $(this)
                        .css({'background-image': 'url(img/hotwater.jpg)'})
                        .animate({opacity: 1}, 6000);
                });*/
		});

        $('.valvestart').click(function() {
            $('.valvestart').animate({  borderSpacing: -90 }, {
                step: function(now,fx) {
                    $(this).css('-webkit-transform','rotate('+now+'deg)');
                    $(this).css('-moz-transform','rotate('+now+'deg)');
                    $(this).css('transform','rotate('+now+'deg)');
                },
                duration:'slow'
            },'linear');
            PipeGame.startWater();
        });

        $('.valvehot').click(function() {
            $('.valvehot').animate({  borderSpacing: -90 }, {
                step: function(now,fx) {
                    $(this).css('-webkit-transform','rotate('+now+'deg)');
                    $(this).css('-moz-transform','rotate('+now+'deg)');
                    $(this).css('transform','rotate('+now+'deg)');
                },
                duration:'slow'
            },'linear');
            $('.water')
                .animate({opacity: 0.3}, 2000, function() {
                    $(this)
                        .css({'background-image': 'url(img/hotwater.jpg)'})
                        .animate({opacity: 1}, 6000);
                });
        });

	}

	function _startWater() {
		clearInterval(_startTimer);
		if(_firstToFill.full == 0){
			_firstToFill.fill(3);
			
		}
	}

	return {
		setGameBoard : _setGameBoard,
		configure : _configure,
		fillSpeed : _fillSpeed,
		startWater : _startWater,
        pipeLevel : _pipeLevel
	}

})();
