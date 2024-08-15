
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');


const grid=32;

const level1=[
    ['R','R','Y','Y','B','B','G','G'],
    ['R','R','Y','Y','B','B','G'],
    ['B','B','G','G','R','R','Y','Y'],
    ['B','G','G','R','R','Y','Y']
];


const colorMap={
    'R': 'red',
    'G': 'green',
    'B': 'blue',
    'Y': 'yellow'
};

const colors = Object.values(colorMap);
const bubbleGap=1;

const wallSize=4;
const bubbles=[];
let particles=[];

function degToRad(deg){
    return (deg*Math.PI)/180;
}


function rotatePoint(x,y,angle){
    let sin=Math.sin(angle);
    let cos=Math.cos(angle);

    return{
        x: x*cos-y*sin,
        y: x*sin+y*cos};
    }


    function getRandomInt(min,max){
        min=Math.ceil(min);
        max=Math.floor(max);

        return Math.floor(Math.random()*(max-min+1))+min;
    }

    function getDistance(obj1,obj2){
        const distx=obj1.x-obj2.x;
        const disty=obj1.y-obj2.y;
        return Math.sqrt(distx*distx+disty*disty);
    }

    function collides(obj1,obj2){
        return getDistance(obj1,obj2)<obj1.radius+obj2.radius;
    }


    function getClosestBubble(obj,activeState=false){
        const closestBubbles = bubbles.filter(bubble=>bubble.active==activeState && collides(obj, bubble));

        if(!closestBubbles.length){
            return;
        }

        return closestBubbles
        .map(bubble=>{
            return{
                distance: getDistance(obj, bubble),
                bubble}
            })
            .sort((a,b)=>a.distance-b.distance)[0].bubble;
        }


        function createBubble(x,y,color){
            const row=Math.floor(y/grid);
            const col=Math.floor(x/grid);

            const startX=row%2===0 ? 0:0.5*grid;

            const center=grid/2;

            bubbles.push({
                x:wallSize+(grid+bubbleGap)*col+startX+center,
                y:wallSize+(grid+bubbleGap-4)*row+center,
                radius:grid/2,
                color:color,
                active:color?true:false});
            }

        function getNeighbors(bubble){
            const neighbors=[];

            const dirs=[
                rotatePoint(grid,0,0),
                rotatePoint(grid,0,degToRad(60)),
                rotatePoint(grid,0,degToRad(120)),
                rotatePoint(grid,0,degToRad(180)),
                rotatePoint(grid,0,degToRad(240)),
                rotatePoint(grid,0,degToRad(300))
            ];

            for(let i=0;i<dirs.length;i++){
                const dir=dirs[i];

                const newBubble={
                    x:bubble.x+dir.x,
                    y:bubble.y+dir.y,
                    radius:bubble.radius};
                    const neighbor = getClosestBubble(newBubble,true);
                    if(neighbor && neighbor!== bubble && !neighbors.includes(neighbor)){
                        neighbors.push(neighbor);
                    }
            }
            return neighbors;
        }

        function removeMatch(targetBubble){
            const matches=[targetBubble];

            bubbles.forEach(bubble=>bubble.processed=false);
            targetBubble.processed=true;

            let neighbors=getNeighbors(targetBubble);
            for(let i=0;i<neighbors.length;i++){
                let neighbor = neighbors[i];

                if(!neighbor.processed){
                    neighbor.processed=true;

                    if(neighbor.color===targetBubble.color){
                        matches.push(neighbor);
                        neighbors=neighbors.concat(getNeighbors(neighbor));
                    }
                }
            }

            if(matches.length>=3){
                matches.forEach(bubble=>{
                    bubble.active=false;
                });
            }
        }

        //continue 11:07

        function dropFloatingBubbles(){
            const activeBubbles = bubbles.filter(bubble=>bubble.active);
            activeBubbles.forEach(bubble=>bubble.processed=false);

            let neighbors=activeBubbles.filter(bubble=>bubble.y-grid<=wallSize);

            for(let i=0;i<neighbors.length;i++){
                let neighbor=neighbors[i];

                if(!neighbor.processed){
                    neighbor.processed=true;
                    neighbors=neighbors.concat(getNeighbors(neighbor));
                }
            }

            activeBubbles.filter(bubble=>!bubble.processed)
            .forEach(bubble=>{
                bubble.active=false;
                particles.push({
                    x:bubble.x,
                    y:bubble.y,
                    color:bubble.color,
                    radius:bubble.radius,
                    active:true});
            });
        }

        for(let row=0;row<10;row++){
            for(let col=0;col<(row%2===0?8:7);col++){
                const color = level1[row]?.[col];
                createBubble(col*grid,row*grid,colorMap[color]);
            }
        }

        const curBubblePos={
            x:canvas.width/2,
            y:canvas.height-grid*1.5
        };

        const curBubble={
            x:curBubblePos.x,
            y:curBubblePos.y,
            color:'red',
            radius:grid/2,
            speed:8,
            dx:0,
            dy:0
        };

        let shootDeg=0;

        const minDeg=degToRad(-60);
        const maxDeg=degToRad(60);

        let shootDir=0;

        function getNewBubble(){
            curBubble.x=curBubblePos.x;
            curBubble.y=curBubblePos.y;
            curBubble.dx=curBubble.dy=0;

            const randInt = getRandomInt(0,colors.length-1);
            curBubble.color=colors[randInt];
        }

        function handleCollision(bubble){
            bubble.color=curBubble.color;
            bubble.active=true;
            getNewBubble();
            removeMatch(bubble);
            dropFloatingBubbles();
        }


        function loop(){
            requestAnimationFrame(loop);
            context.clearRect(0,0,canvas.width,canvas.height);

            shootDeg=shootDeg+degToRad(2)*shootDir;

            if(shootDeg<minDeg){
                shootDeg=minDeg;
            }
            else if(shootDeg>maxDeg){
                shootDeg=maxDeg;
            }

            curBubble.x+=curBubble.dx;
            curBubble.y+=curBubble.dy;

            if(curBubble.x-grid/2<wallSize){
                curBubble.x=wallSize+grid/2;
                curBubble.dx*=-1;
            }
            else if(curBubble.x+grid/2 > canvas.width-wallSize){
                curBubble.x=canvas.width-wallSize-grid/2;
                curBubble.dx*=-1;
            }


            if(curBubble.y-grid/2<wallSize){
                const closestBubble = getClosestBubble(curBubble);
                handleCollision(closestBubble);
            }

            for(let i=0;i<bubbles.length;i++){
                const bubble=bubbles[i];

                if(bubble.active && collides(curBubble,bubble)){
                    const closestBubble=getClosestBubble(curBubble);
                    if(!closestBubble){
                        window.alert('Game over');
                        window.location.reload();
                    }

                    if(closestBubble){
                        handleCollision(closestBubble);
                    }
                }
            }

            particles.forEach(particle=>{
                particle.y+=8;
            });

            particles=particles.filter(particles=>particles.y < canvas.height-grid/2);

            context.fillStyle = 'lightgrey';
            context.fillRect(0,0,canvas.width,wallSize);
            context.fillRect(0,0,wallSize,canvas.height);
            context.fillRect(canvas.width-wallSize,0,wallSize,canvas.height);

            bubbles.concat(particles).forEach(bubble=>{
                if(!bubble.active) return;
                context.fillStyle=bubble.color;

                context.beginPath();
                context.arc(bubble.x,bubble.y,bubble.radius,0,2,Math.PI);
                context.fill();
            });

            context.save();

            context.translate(curBubblePos.x,curBubblePos.y);
            context.rotate(shootDeg);

            context.translate(0,-grid/2*4.5);

            context.strokeStyle='white';
            context.lineWidth=2;
            context.beginPath();
            context.moveTo(0,0);
            context.lineTo(0,grid*2);
            context.moveTo(0,0);
            context.lineTo(-10,grid*0.4);
            context.moveTo(0,0);
            context.lineTo(10,grid*0.4);
            context.stroke();

            context.restore();


            context.fillStyle=curBubble.color;
            context.beginPath();
            context.arc(curBubble.x,curBubble.y,curBubble.radius,0,2*Math.PI);
            context.fill();
        }

        document.addEventListener('keydown',(e)=>{
            if(e.code==='ArrowLeft'){
                shootDir=-1;
            }
            else if(e.code==='ArrowRight'){
                shootDir=1;
            }


            if(e.code=='Space' && curBubble.dx===0 && curBubble.dy===0){
                curBubble.dx=Math.sin(shootDeg)*curBubble.speed;
                curBubble.dy=-Math.cos(shootDeg)*curBubble.speed;
            }
        });


        document.addEventListener('keyup',(e) => {
            if((e.code==='ArrowLeft' && shootDir===-1)|| (e.code==='ArrowRight' && shootDir===1)){
                shootDir=0;
            }
        });

        requestAnimationFrame(loop);