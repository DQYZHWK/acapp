class FireBall extends AcGameObject{
    constructor(playground,player,x,y,radius,vx,vy,color,speed,move_length,damage){
        super();
        console.log("fireball con");
        this.playground=playground;
        this.player=player;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.speed=speed;
        this.move_length=move_length;
        this.damage=damage;
        this.eps=0.1;
        this.ctx=this.playground.game_map.ctx;
    }
    start(){

    }
    update(){
        console.log("upd");
        if(this.move_length<this.eps){
            this.destory();
            return false;
        }
        //渲染前更新最新信息
        let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.move_length-=moved;

        for(let i=0;i<this.playground.players.length;i++){
            let player=this.playground.players[i];
            if(this.player!=player&&this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }


    get_dist(x1,y1,x2,y2){
        let dx=x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }

    is_collision(player){
        let distance=this.get_dist(player.x,player.y,this.x,this.y);
        if(distance<this.radius+player.radius)return true;
        return false;
    }

    //发生碰撞时：对玩家对象造成伤害，自己从渲染列表中删除
    attack(player){
        let angle=Math.atan2(this.y-player.y,this.x-player.x);
        player.is_attacked(angle,this.damage);
        this.destory();
    }
}
