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
