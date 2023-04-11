class AcGameMenu{
    constructor(root){
        this.root=root;
        this.$menu =$(`
        <div class="ac-game-menu">
             <div class="ac-game-menu-field">
                   
                   <div class="ac-game-menu-field-item ac-game-menu-field-item-single">
                        单人模式
                   </div>
                  <br> 
                   <div class="ac-game-menu-field-item ac-game-menu-field-item-multi">
                        多人模式
                   </div>
                   <br>
                   <div class="ac-game-menu-field-item ac-game-menu-field-item-setting">
                        设置
                   </div>

             </div>
        </div>
`);
        this.root.$ac_game.append(this.$menu);//add content to AcGame banding de div
        this.$single = this.$menu.find('.ac-game-menu-field-item-single');//根据类名找标签对象

        this.$multi = this.$menu.find('.ac-game-menu-field-item-multi');
        this.$setting = this.$menu.find('.ac-game-menu-field-item-setting');

        this.start();
   }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        //console.log("yegou");
        let outer=this;
        this.$single.click(function(){
            outer.hide();//close menu
            outer.root.playground.show();
        });
        this.$multi.click(function(){
            console.log("click multi mode");
        });
        this.$setting.click(function(){

            console.log("click setting ");
        });
    }
    
    show(){
        this.$menu.show();
    }

    hide(){
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];//需要渲染的对象列表

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔
    }

    start() {  // 只会在第一帧执行一次
    }

    update() {  // 每一帧均会执行一次
    }

    on_destory() {  // 在被销毁前执行一次
    }

    destory() {  // 删掉该物体
        this.on_destory();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
        console.log("duixiang"+AC_GAME_OBJECTS.length);
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ ) {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start){//第一帧：完成一些初始信息
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;//对每一帧进行渲染
            obj.update();
        }
    }
    last_timestamp = timestamp;

    requestAnimationFrame(AC_GAME_ANIMATION);
}


requestAnimationFrame(AC_GAME_ANIMATION);//游戏引擎实现每秒60帧的渲染

class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
   }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 1;
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destory();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
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
        this.is_me = is_me;
        this.eps = 0.1;
        this.friction = 0.9;
        this.spent_time = 0;

        this.cur_skill = null;
    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
        else{
            let nx=Math.random()*this.playground.width;
            let ny=Math.random()*this.playground.height;
            this.move_to(nx,ny);
        }
    }
    add_listening_events(){
        let outer=this;
        //防止鼠标右键出现奇怪的东西
        this.playground.game_map.$canvas.on("contextmenu",function(e){return false;});

        //canvas：监测鼠标
        this.playground.game_map.$canvas.mousedown(function(e){
            const rect=outer.ctx.canvas.getBoundingClientRect();

            if(e.which===3&&outer.radius>=10){
                outer.move_to(e.clientX - rect.left,e.clientY - rect.top);
            }else if(e.which===1&&outer.radius>=10){
                if(outer.cur_skill==="fireball"){
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY -rect.top);
                }
                outer.cur_skill=null;
            }
        });

        //window程序调用：监测键盘
        $(window).keydown(function(e){
            if(e.which===81&&outer.radius>=10){
                outer.cur_skill="fireball";
                return false;
            }
        });
    }

    shoot_fireball(nx,ny){
        let x=this.x, y=this.y;
        let radius=this.playground.height*0.01;
        let angle=Math.atan2(ny-y,nx-x);
        let vx=Math.cos(angle);
        let vy=Math.sin(angle);
        let color="orange";
        let speed=this.playground.height*0.5;
        let move_length=this.playground.height;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height*0.01);
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
        if(this.radius<10){
            this.destory();
            return false;
        }
        this.damage_x=Math.cos(angle);
        this.damage_y=Math.sin(angle);
        this.damage_speed=damage*100;
        this.speed*=0.8;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destory() {
        //基类的destory实现从渲染对象列表中删除，继承类根据需要实现其他信息的删除
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
        //4.1（debug：死亡时清除监听）

        console.log(this.playground.players.length);
    }
}

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
        let angle=Math.atan2(player.y-this.y,player.x-this.x);
        player.is_attacked(angle,this.damage);
        this.destory();
    }
}
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
    }

    show() {  // 打开playground界面
        this.$playground.show(); 
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players=[];
        this.players.push(new Player(this, this.width/2, this.height/2, this.height*0.05, "white", this.height*0.15,true));
        for(let i=0;i<5;i++){
            this.players.push(new Player(this, this.width/2, this.height/2 ,this.height*0.05, this.get_random_color(), this.height*0.15, false));
        }

    }

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

export class AcGame{
    constructor(id){
        this.id=id;   
        this.$ac_game=$('#'+id);//get a div by id
        this.menu=new AcGameMenu(this);//why can look AcGameMenu : pack by sort
        this.playground=new AcGamePlayground(this);
        this.start();
    }
    
    start(){

    }
     
}
