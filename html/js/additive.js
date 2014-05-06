$(document).ready(function(){

    var board =[[[0,0,1,1],[1,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
                [[0,0,0,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]],
                [[0,0,0,0],[0,0,0,0],[0,0,1,1],[1,0,0,1],[0,0,1,1],[1,1,0,0]],
                [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,0,1]]];

	PipeGame.configure({
		cols: 4,
		rows: 6,
		startX:0,
		StartY:0,
		lastX:3,
		lastY:5,
		additiveMode: true,
        autoStart: 30000,
        level: board
	});
	
	PipeGame.setGameBoard(board);	
});

