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
class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`<div>游戏界面</div>`);
        
        this.hide();

        this.root.$ac_game.append(this.$playground);
        this.start();
    }
    
    start(){
       
    }

    show(){//
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }

}
class AcGame{
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
