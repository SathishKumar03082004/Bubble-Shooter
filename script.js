
window.onload=function(){
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    var lastframe =0;
    var fpstime=0;
    var framecount=0;
    var fps=0;

    var initialized=false;

    var level={
        x: 4,
        y: 83,
        width: 0,
        height: 0,
        columns: 15,
        rows: 14,
        tilewidth: 40,
        tileheight: 40,
        rowheight: 34,
        radius: 20,
        tiles: []
    };

    var Tile=function(x,y,type,shift){
        this.x=x;
        this.y=y;
        this.type=type;
        this.removed=false;
        this.shift=shift;
        this.velocity=0;
        this.alpha=1;
        this.processed=false;
    };

    var player={
        x:0,
        y:0,
        angle: 0,
        tiletype:0,
        bubble:{
            x:0,
            y:0,
            angle: 0,
            speed: 1000,
            dropspeed: 900,
            tiletype: 0,
            visible: false
        },

        nextbubble:{
            x:0,
            y:0,
            tiletype:0
        }
    };

    var neighborsoffsets = [[[1,0],[0,1] ,[-1,1] ,[-1.0], [-1,-1],[0,-1]],
                            [[1,0], [1,1], [0,1], [-1,0], [0,-1], [1,-1]]];


    var bubblecolors=7;

    var gamestates={init:0, ready:1, shootbubble:2, removecluster:3, gameover:4};
    var gamestate =gamestates.init;

    var score=0;

    var turncounter=0;
    var rowoffset=0;

    var animationstate=0;
    var animationtime=0;

    var showcluster=false;
    var cluster=[];
    var floatingclusters=[];


    var images=[];
    var bubbleimage;
    
    var loadcount=0;
    var loadtotal=0;
    var preloaded=false;

    function loadImages(imagefiles){
        loadcount=0;
        loadtotal=imagefiles.length;
        preloaded=false;

        var loadedImages=[];
        for(var i=0;i<imagefiles.length;i++){
            var image=new Image();

            image.onload=function(){
                loadcount++;
                if(loadcount==loadtotal){
                    preloaded=true;
                }
            };

            image.src= imagefiles[i];
            loadImages[i]=image;
        }

        return loadedImages;
    }

    function init(){

        images = loadImages(["https://github.com/shaongithub/bubble-game/blob/main/buble-ball.png?raw=true"]);
        bubbleimage=images[0];

        canvas.addEventListener("mousemove",onMouseMove);
        canvas.addEventListener("mousedown",onMouseDown);

        for(var i=0;i<level.columns; i++){
            level.tiles[i]=[];
            for(var j=0;j<level.rows;j++){
                level.tiles[i][j]=new Tile(i,j,0,0);
            }
        }

        level.width=level.columns*level.tilewidth+level.tilewidth/2;
        level.height=(level.rows-1)*level.rowheight+level.tileheight;

        player.x=level.x+level.width/2-level.tilewidth/2;
        player.y=level.y+level.height;
        player.angle=90;
        player.tiletype=0;

        player.nextbubble.x=player.x-2*level.tilewidth;
        player.nextbubble.y=player.y;

        newGame();

        main(0);
    }

    function main(tframe){
        window.requestAnimationFrame(main);

        if(!initialized){
            context.clearReact(0,0,canvas.width,canvas.height);

            drawFrame();

            var loadpercentage = loadcount/loadtotal;
            context.strokeStyle = "#56c204";
            context.lineWidth=3;
            context.strokeRect(18.5, 0.5 + canvas.height - 51, canvas.width-37, 32);
            context.fillStyle = "#56c204";
            context.fillRect(18.5, 0.5 + canvas.height - 51, loadpercentage*(canvas.width-37), 32);

            var loadtext="Loaded "+loadcount+"/"+loadtotal+" images";
            context.fillStyle="#000000";
            context.font="16px Verdana";
            context.fillText(loadtext,18,0.5,+canvas.height-63);

            if(preloaded){
                setTimeout(function(){initialized=true;},1000);
            }
            else{
                PaymentRequestUpdateEvent(tframe);
                render();
            }
        }

        function update(tframe){
            var dt=(tframe-lastframe)/1000;
            lastframe=tframe;

            updateFps(dt);

            if(gamestate==gamestates.ready){
                
            }
            else if(gamestate==gamestates.shootbubble){
                stateShootBubble(dt);
            }
            else if(gamestate==gamestates.removecluster){
                stateRemoveCluster(dt);
            }
        }

        function setGameState(newgamestate){
            gamestate=newgamestate;

            animationstate=0;
            animationtime=0;
        }

        function stateShootBubble(dt){
            player.bubble.x+=dt*player.bubble.speed*Math.cos(degToRad(player.bubble.angle));
            player.bubble.y+=dt*player.bubble.speed*-1*Math.sin(degToRad(player.bubble.angle));

            
        }
    }
}