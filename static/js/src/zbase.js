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
