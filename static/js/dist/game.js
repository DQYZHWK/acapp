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
                        退出
                   </div>

             </div>
        </div>
`);
       // this.$menu.hide();
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
        let outer=this;
        this.$single.click(function(){
            outer.hide();//close menu
            outer.root.playground.show("single mode");
        });
        this.$multi.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$setting.click(function(){
            outer.root.setting.logout_on_remote();
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
        this.uuid = this.create_uuid();
    }

   create_uuid(){
       let res = "";
       for (let i = 0; i < 8; i++)
       {
           let x = Math.floor(Math.random()*10);
           res+=x;
       }
       return res;
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

class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) {  // ESC
                outer.hide_input();
                return false;
            } else if (e.which === 13) {  // ENTER
                let username = outer.playground.root.setting.username;
                let text = outer.$input.val();
                if (text) {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);
                }
                return false;
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();

        if (this.func_id) clearTimeout(this.func_id);

        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    show_input() {
        this.show_history();

        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}
class GameMap extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start() {
        this.$canvas.focus();
    }
    resize(){
        this.ctx.canvas.width=this.playground.width;
        this.ctx.canvas.height=this.playground.height;

        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}

class NoticeBoard extends AcGameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";

    }
    
    start(){
    }
    
    write(text){
        this.text=text;
    }

    update(){
        this.render();
    }
    
    render(){
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text,this.playground.width/2,20);
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
        this.eps = 0.01;
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
        let scale=this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x*scale, this.y*scale, this.radius*scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}

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
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.flash_coldtime = 5;  // 单位：秒
            this.flash_img = new Image();
            this.flash_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }

    }

    start(){

        this.playground.player_count ++ ;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "人");

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }
        if (this.character === "me"){
            this.add_listening_events();
        }
        else if (this.character === "robot"){
            let nx=Math.random()*this.playground.width/this.playground.scale;
            let ny=Math.random()*this.playground.height/this.playground.scale;
            this.move_to(nx,ny);
        }
    }
    add_listening_events(){
        let outer=this;
        //防止鼠标右键出现奇怪的东西
        this.playground.game_map.$canvas.on("contextmenu",function(){return false;});

        //canvas：监测鼠标
        this.playground.game_map.$canvas.mousedown(function(e){

            if (outer.playground.state !=="fighting")
                return true;
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
                    if(outer.fireball_coldtime > outer.eps)
                        return false;
                    let fireball = outer.shoot_fireball(tx,ty);
                    if(outer.playground.mode === "multi mode"){
                        outer.playground.mps.send_shoot_fireball(tx,ty,fireball.uuid);
                    }
                }
                if (outer.cur_skill === "flash") {
                    if (outer.flash_coldtime > outer.eps)
                        return false;

                    outer.flash(tx, ty);

                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_flash(tx, ty);
                    }

                }
                outer.cur_skill = null;
            }

        });

        //window程序调用：监测键盘 -> canvas检测键盘事件，注意参数tabindex=1
        this.playground.game_map.$canvas.keydown(function(e) {
            if(e.which === 13){
                if(outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.show_input();//转移焦点到输入框
                    return false;
                }
            }
            else if(e.which===27){
                if(outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.hide_input();
                }
            }
            if (outer.playground.state!== "fighting")
                return true;
            if(e.which===81&&outer.radius>=outer.eps){
                if(outer.fireball_coldtime > outer.eps)
                    return true;
                outer.cur_skill="fireball";
                return false;
            }
            else if(e.which === 70){
                if(outer.flash_coldtime >outer.eps)
                   return true;
                outer.cur_skill = "flash";
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
        this.fireball_coldtime = 3;
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
    
    flash(tx,ty){
        let d = this.get_dist(this.x,this.y,tx,ty);
        d= Math.min(d,0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
        this.flash_coldtime = 5;
        this.move_length = 0; //闪现后停止移动
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker){
        attacker.destory_fireball(ball_uuid);
        this.x = x;
        this.y = y;
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
        this.spent_time += this.timedelta /1000;
        if(this.character === "me" && this.playground.state ==="fighting"){
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.flash_coldtime -= this.timedelta / 1000;
        this.flash_coldtime = Math.max(this.flash_coldtime, 0);
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
        if(this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }
	render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.flash_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.flash_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.flash_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destory() {
        //基类的destory实现从渲染对象列表中删除，继承类根据需要实现其他信息的删除
        if(this.character === "me"){
            this.playground.state="over";
        }
        for (let i = 0; i < this.playground.players.length; i ++ ) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
        //4.1（debug：死亡时清除监听）

    }
}

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
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app5236.acapp.acwing.com.cn/wss/multiplayer/");


        this.start();
    }

    start() {
        this.receive();
    }

    receive(){
        let outer = this;
        this.ws.onmessage = function(e) {//每当有信息通过管道传递到当前点，需要过滤来自自己的信息
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            else if(event === "move_to"){
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid,data.tx,data.ty, data.ball_uuid);
            }
            else if(event ==="attack"){
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
            else if(event === "flash"){
               outer.receive_flash(uuid, data.tx, data.ty);
            }
            else if(event === "message"){
                outer.receive_message(uuid,data.username,data.text);
            }
        };
    }
    // st1:client to server
    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    // st4:client receive the broadcasst
    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }
    
    get_player(uuid){
        let players=this.playground.players;
        for (let i=0;i<players.length;i++){
            let player=players[i];
            if(player.uuid === uuid)return player;
        }
        return null;
    }
    
    send_move_to(tx,ty){
         let outer = this;
         this.ws.send(JSON.stringify({
                'event' : "move_to",
                'uuid' : outer.uuid,
                'tx' : tx,
                'ty' : ty,
        }));
    }
    receive_move_to(uuid,tx,ty){
        let player=this.get_player(uuid);
        if(player){
            player.move_to(tx,ty);
        }
    }
    
    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "shoot_fireball",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
            'ball_uuid' : ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        let player=this.get_player(uuid);
        if(player){
            let fireball= player.shoot_fireball(tx,ty);
            fireball.uuid = ball_uuid;  //确定各窗口元素标号一致性
        }
    }
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;  //确定各窗口元素标号一致性
        this.ws.send(JSON.stringify({
            'event' : "attack",
            'uuid' : outer.uuid,
            'attackee_uuid' : attackee_uuid,
            'x' : x,
            'y' : y,
            'angle' : angle,
            'damage' : damage,
            'ball_uuid' : ball_uuid,
        }));
    }
    receive_attack(uuid, attackee_uuid, x , y, angle, damage, ball_uuid){
        let attacker =this.get_player(uuid);
        let attackee =this.get_player(attackee_uuid);
        if(attacker&&attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }
    
    send_flash(tx,ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "flash",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
        }));
    }
    
    receive_flash(uuid,tx,ty){
        let player = this.get_player(uuid);
        if(player){
            player.flash(tx,ty);
        }
    }

   send_message(username, text) {
        let outer =this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uuid, username, text) {
        this.playground.chat_field.add_message(username, text);
    }
}

class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide();

        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    get_random_color() {
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 5)];
    }

    start() {
        let outer=this;
        $(window).resize(function(){
            outer.resize();
        })
    }
    resize(){
        this.width=this.$playground.width();
        this.height=this.$playground.height();
        let unit=Math.min(this.width/16,this.height/9);
        this.width=unit*16;
        this.height=unit*9;
        this.scale=this.height;
        if(this.game_map)this.game_map.resize();

    }
    show(mode) {  // 打开playground界面
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height()
        this.game_map = new GameMap(this);
        this.mode = mode;
        this.state = "waiting";//"waiting ->figting -> over"
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;
        this.resize();
        this.players=[];
        
        this.players.push(new Player(this, this.width/2/this.scale, 0.5 , 0.05, "white", 0.15,"me", this.root.setting.username, this.root.setting.photo));
        if (mode === "single mode"){
            for(let i=0;i<5;i++){
                this.players.push(new Player(this, this.width/2/this.scale, 0.5 , 0.05 , this.get_random_color(), 0.15, "robot"));
            }  
        }
        else if (mode === "multi mode"){
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            
            this.mps.ws.onopen = function(){ // wss连接创建成功的回调函数 
                outer.mps.send_create_player(outer.root.setting.username, outer.root.setting.photo);
            };
        }

    } 

    hide() {  // 关闭playground界面
        this.$playground.hide();
    }
}

class Setting {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.acwingos) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$setting = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                 <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>
    </div>
</div>
`);
        this.$login = this.$setting.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$setting.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$setting.find(".ac-game-settings-acwing img");
        

        this.root.$ac_game.append(this.$setting);

        this.start();
    }

    start() {

        if(this.platform==="ACAPP"){
            this.getinfo_acapp();
        }
        else{
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer= this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function(){
            outer.acwing_login();
        })
    }

    acwing_login(){
        $.ajax({
            url:"https://app5236.acapp.acwing.com.cn/setting/acwing/apply_code/",
            type:"GET",
            success:function(resp){
                console.log("return");
                if(resp.result=="success"){
                    window.location.replace(resp.apply_code_url);//文件重定向到acwing的授权页面
                }
            }
        })

    }
    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function() {
            outer.register();
        });
        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;
        this.$register_login.click(function() {
            outer.login();
        });
        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login_on_remote() {  // 在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app5236.acapp.acwing.com.cn/setting/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();//第三方登录成功也是刷新一下页面，此时cookie里有登录信息
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_on_remote() {  // 在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app5236.acapp.acwing.com.cn/setting/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success") {
                    location.reload();  // 刷新页面
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {  // 在远程服务器上登出
        if (this.platform === "ACAPP") this.root.acwingos.api.window.close();
        else{
            $.ajax({
                url: "https://app5236.acapp.acwing.com.cn/setting/logout/",
                type: "GET",
                success: function(resp) {
                    if (resp.result === "success") {
                        location.reload();
                    } 
                }
            });
        }
    }

    register() {  // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {  // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }
    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.acwingos.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp() {
        let outer = this;

        $.ajax({
            url: "https://app5236.acapp.acwing.com.cn/setting/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web() {
        let outer = this;
        console.log("getinfo_web");
        $.ajax({
            url: "https://app5236.acapp.acwing.com.cn/setting/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$setting.hide();
    }

    show() {
        this.$setting.show();
    }
}

export class AcGame{
    constructor(id,acwingos){
        this.id=id;   
        this.acwingos=acwingos;
        this.$ac_game=$('#'+id);//get a div by id
        this.setting=new Setting(this);

        this.menu=new AcGameMenu(this);//why can look AcGameMenu : pack by sort
        this.playground=new AcGamePlayground(this);
        this.start();
    }
    
    start(){

    }
     
}
