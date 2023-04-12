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
