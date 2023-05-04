class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9;
        this.spent_time = 0;
        this.fireballs= [];
        this.cur_skill = null;

        if(this.character !== "robot"){
            this.img=new Image();
            this.img.src=this.playground.root.setting.photo;
        }

        /*if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.blink_coldtime = 5;  // 单位：秒
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }*/

    }

    start(){

        /*if(s.playground.player_count ++ ;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }*/
        if (this.character === "me"){
            this.add_listening_events();
        }
        else{
            let nx=Math.random()*this.playground.width/this.playground.scale;
            let ny=Math.random()*this.playground.height/this.playground.scale;
            this.move_to(nx,ny);
        }
    }
    add_listening_events(){
        let outer=this;
        //防止鼠标右键出现奇怪的东西
        this.playground.game_map.$canvas.on("contextmenu",function(e){return false;});

        //canvas：监测鼠标
        this.playground.game_map.$canvas.mousedown(function(e){
            /*
             if (outer.playground.state !=="fighting")
                return false;
             * */
            const rect=outer.ctx.canvas.getBoundingClientRect();

            if(e.which===3&&outer.radius>outer.eps){
                let tx=(e.clientX - rect.left)/outer.playground.scale;
                let ty=(e.clientY - rect.top)/outer.playground.scale;
                outer.move_to(tx,ty);
                if(outer.playground.mode==="multi mode"){
                    outer.playground.mps.send_move_to(tx,ty);
                }
            }else if(e.which===1&&outer.radius>outer.eps){
                let tx=(e.clientX - rect.left)/outer.playground.scale;
                let ty=(e.clientY - rect.top)/outer.playground.scale;
                if(outer.cur_skill==="fireball"){
                    let fireball = outer.shoot_fireball(tx,ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx,ty,fireball.uuid);
                    }

                }
                outer.cur_skill=null;
            }
        });

        //window程序调用：监测键盘
        $(window).keydown(function(e){
            if(e.which===81&&outer.radius>=outer.eps){
                outer.cur_skill="fireball";
                return false;
            }
        });
    }

    shoot_fireball(nx,ny){
        let x=this.x, y=this.y;
        let radius=0.01;
        let angle=Math.atan2(ny-y,nx-x);
        let vx=Math.cos(angle);
        let vy=Math.sin(angle);
        let color="orange";
        let speed=0.5;
        let move_length = 1;
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);
        return fireball;
    }
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }
    destory_fireball(uuid){
        for(let i=0;i<this.fireballs.length;i++){
            let fireball = this.fireballs[i];
            if(fireball.uuid === uuid){
                fireball.destory();
                break;
            }
        }
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker){
        attacker.destory_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        console.log("is attack");
        this.is_attacked(angle, damage);
    }
    is_attacked(angle,damage){

        for(let i=0;i<20+Math.random()*10;i++){
            let x=this.x,y=this.y;
            let radius=this.radius*Math.random()*0.15;
            let angle=Math.PI*2*Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            let color=this.color;
            let speed=this.speed*10;
            let move_length=this.radius*Math.random()*5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed,move_length);
        }

        this.radius-=damage;
        if(this.radius<this.eps){
            this.destory(); 
            return false;
        }
        this.damage_x=Math.cos(angle);
        this.damage_y=Math.sin(angle);
        this.damage_speed=damage*100;
        this.speed*=0.8;
    }

    update() {
        this.update_move();
        this.render();
    }
    update_move(){
        this.spent_time += this.timedelta / 1000;
        if (this.character==="robot" && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > this.eps) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width/this.playground.scale;
                    let ty = Math.random();
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }
    render() {
        let scale = this.playground.scale;
        if(this.character!=="robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x*scale, this.y*scale, this.radius*scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius)*scale, (this.y - this.radius)*scale, this.radius * 2*scale, this.radius * 2*scale); 
            this.ctx.restore();
        }

        else{
            this.ctx.beginPath();
            this.ctx.arc(this.x*scale, this.y*scale, this.radius*scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
    on_destory() {
        //基类的destory实现从渲染对象列表中删除，继承类根据需要实现其他信息的删除
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
        //4.1（debug：死亡时清除监听）

    }
}

