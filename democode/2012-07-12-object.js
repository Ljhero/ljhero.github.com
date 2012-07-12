
// 
var newObject = new Object();
//
newObject.firstName = "Ljhero";
//
newObject.sayName = function() {
	alert(this.firstName);
}

var name = newObject["firstName"];

newObject["sayName"]();

    function sayLoudly(){
    	alert(this.firstName.toUpperCase());
    }

    newObject.sayLoudly = sayLoudly;
    
    var whatVolume = 2;
    var whatFunction;
    if (whatVolume == 1) {
    	whatFunction = "sayName";
    }else if (whatVolume == 2) {
    	whatFunction = "sayLoudly";
    };
    
    newObject[whatFunction]();        

    var newObject = {
    	firstName = "Ljhero",
    	sayName: function() {
	          alert(this.firstName);
	      },
	    sayLoudly: sayLoudly,
	    LastName: {
	    	lastname: "LJHERO",
	    	sayName: function() {alert(this.lastname);}
	    }
    };

    newObject.LastName.sayName();

    function Person(name){
    	this.name = name;
    	this.sayName = function(){
    		alert(this.name);
    	}
    }

    var one = new Person("ljhero");
    one.sayName();

    var two = new Person("LJHERO");
    two.sayName();

    function Person(name){
    	this.name = name;
    }

    Person.prototype.sayName = function(){
    		alert(this.name);
    };

    var p = new Person("ljhero");
    p.sayName();

    var Person = {
    	name: "ljhero",
    	sayName: function(){
    		alert(this.name);
    	}
    };

    var p = Object.create(Person);
    p.sayName();

    var res = '{name:"ljhero",sayName: function() {alert(this.name);}}';

    var p = eval('('+res+')');
    p.sayName();