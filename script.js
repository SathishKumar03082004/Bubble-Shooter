
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
            const neighbors=[],

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

        