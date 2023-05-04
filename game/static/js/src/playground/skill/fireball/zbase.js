class FireBall extends AcGameObject{
    constructor(playground,player,x,y,radius,vx,vy,color,speed,move_length,damage){
        super();
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
        this.eps=0.01;
        this.ctx=this.playground.game_map.ctx;
    }
    start(){

    }
    update(){
        if(this.move_length<this.eps){
            this.destory();
            return false;
        }
        //渲染前更新最新信息
        this.update_move();
        //碰撞检测交由产生这个子弹的窗口，保证各个窗口内状态一致
        if(this.player.character !== "enemy")
            this.update_attack();

        this.render();
    }
    update_move(){
        let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.move_length-=moved;

    }
    update_attack(){
         for(let i=0;i<this.playground.players.length;i++){
            let player=this.playground.players[i];
            if(this.player!=player&&this.is_collision(player)){
                this.attack(player);
                break;
            }
        }
    }
    render(){
        let scale=this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
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
        let angle=Math.atan2(player.y-this.y,player.x-this.x);
        player.is_attacked(angle,this.damage);
        if(this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destory();
    }
    
    on_destory(){ //达到射程极限：毁一个对象，需要清除他的所有引用
        let fireballs = this.player.fireballs;
        for (let i=0;i<fireballs.length;i++){
            if(fireballs[i] === this){
                fireballs.splice(i,1);
                break;
            }
        }
    }
}
