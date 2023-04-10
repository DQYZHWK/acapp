for (let i=1;i<=10;i++){
   console.log(i);
}

export class A{
    constructor(name,age,id){
        this.$out=$('#' +id);
        this.name=name;
        this.age=age;
        this.$out.append(this.name);
        this.show();
    }

    show(){
        console.log(this.name);
        console.log(this.age);
    }
}



