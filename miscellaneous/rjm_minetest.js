class RJMTurtle {
    constructor() {
        this.block = "1";
        this.nib = [[0,0,0]];
        this.pos = [0,0,0];
        this.penDown = true;
        this.matrix = null;
        this.TO_RADIANS = Math.PI / 180;
    }
    
    clone() {
        var t = new RJMTurtle();
        t.block = this.block;
        t.nib = this.nib;
        t.pos = this.pos;
        t.penDown = this.penDown;
        t.matrix = this.matrix;
        return t;
    }
    
    mmMultiply(a,b) {
        var c = [[0,0,0],[0,0,0],[0,0,0]];
        for (var i = 0; i < 3 ; i++) for (var j = 0; j < 3 ; j++)
          c[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
        return c;
    };
    
    mod(n,m) {
        return ((n%m)+m)%m;
    };
    
    cosDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [1,0,-1,0][this.mod(angle,360)/90];
        }
        else {
            return Math.cos(angle * this.TO_RADIANS);
        }
    }
    
    sinDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [0,1,0,-1][this.mod(angle,360)/90];
        }
        else {
            return Math.sin(angle * this.TO_RADIANS);
        }
    }
    
    yawMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, 0, -s],
                [0, 1, 0],
                [s, 0, c]];
    };
    
    rollMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, -s, 0],
                [s,  c, 0],
                [0,  0, 1]];
    };
    
    pitchMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[1, 0, 0],
                [0, c, s],
                [0,-s, c]];
    };
}

class RaspberryJamMod {
    constructor(runtime) {
        this.clear();
    }
    
    clear() {
        this.socket = null;
        this.hits = [];
        this.turtle = new RJMTurtle();
        this.turtleHistory = [];
        this.savedBlocks = null;
    }
    
    getInfo() {
        return {
            "id": "RaspberryJamMod",
            "name": "Minetest",
            
            "blocks": [{
                    "opcode": "connect_p",
                    "blockType": "command",
                    "text": "Połącz się z grą na [ip]",
                    "arguments": {
                        "ip": {
                            "type": "string",
                            "defaultValue": "localhost"
                        },
                    }
            },
            {
                    "opcode": "chat",
                    "blockType": "command",
                    "text": "Wyślij na chat [msg]",
                    "arguments": {
                        "msg": {
                            "type": "string",
                            "defaultValue": "Witaj, Świecie!"
                        },
                    }
            },            
            {
                    "opcode": "blockByName",
                    "blockType": "reporter",
                    "text": "ID bloku [name]",
                    "arguments": {
                        "name": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
            {
                    "opcode": "getBlock",
                    "blockType": "reporter",
                    "text": "ID bloku na pozycji (X: [x], Y: [y], Z: [z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },             
/*            {
                    "opcode": "haveBlock",
                    "blockType": "Boolean",
                    "text": "have [b] at ([x],[y],[z])",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        },
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },             */
            /* {
                    "opcode": "onBlock",
                    "blockType": "Boolean",
                    "text": "player on [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "0,0",
                            "menu": "blockMenu"
                        },
                    }
            }, */
            {
                    "opcode": "getPlayerX",
                    "blockType": "reporter",
                    "text": "Pozycja X [mode] gracza",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerY",
                    "blockType": "reporter",
                    "text": "Pozycja Y [mode] gracza",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerZ",
                    "blockType": "reporter",
                    "text": "Pozycja Z [mode] gracza",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getPlayerVector",
                    "blockType": "reporter",
                    "text": "Pozycja [mode] wektoru gracza ",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getHit",
                    "blockType": "reporter",
                    "text": "pozycja wektora uderzenia mieczem",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "extractFromVector",
                    "blockType": "reporter",
                    "text": "Pozycja [coordinate] wektora [vector]",
                    "arguments": {
                        "coordinate": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "coordinateMenu"
                        },
                        "vector": {
                            "type": "string",
                            "defaultValue": "0,0,0",
                        },
                    }
            },          
            {
                    "opcode": "makeVector",
                    "blockType": "reporter",
                    "text": "wektor ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                    }
            },          
            {
                    "opcode": "setBlock",
                    "blockType": "command",
                    "text": "Umieść [b] na pozycji (X: [x], Y: [y], Z: [z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        },
                    }
            },            
/*            {
                    "opcode": "setBlock",
                    "blockType": "command",
                    "text": "put block with id [b] at ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0"
                        },
                    }
            },       */      
            {
                    "opcode": "setPlayerPos",
                    "blockType": "command",
                    "text": "Teleportuj Gracza na pozycję (X: [x], Y: [y], Z: [z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "movePlayer",
                    "blockType": "command",
                    "text": "Porusz gracza o (X: [dx], Y: [dy], Z: [dz])",
                    "arguments": {
                        "dx": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "dy": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "dz": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },         
            {
                    "opcode": "movePlayerTop",
                    "blockType": "command",
                    "text": "Przenieś gracza na najwyższy blok",
                    "arguments": {
                    }
            },
            {
                    "opcode": "moveTurtle",
                    "blockType": "command",
                    "text": "Porusz żółwia w [dir] o [n] bloków",
                    "arguments": {
                        "dir": {
                            "type": "number",
                            "menu": "moveMenu",
                            "defaultValue": 1
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                    } 
            },            
            {
                    "opcode": "leftTurtle",
                    "blockType": "command",
                    "text": "Obróć żółwia o [n] stopni w lewo",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "rightTurtle",
                    "blockType": "command",
                    "text": "Obróć żółwia o [n] stopni w prawo",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "turnTurtle",
                    "blockType": "command",
                    "text": "[dir] żółwia o [n] stopni",
                    "arguments": {
                        "dir": {
                            "type": "string",
                            "menu": "turnMenu",
                            "defaultValue": "odchylenie"
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "pen",
                    "blockType": "command",
                    "text": "Pisak żółwia w [state]",
                    "arguments": {
                        "state": {
                            "type": "number",
                            "defaultValue": 1,
                            "menu": "penMenu"
                        }
                    }
            },            
            {
                    "opcode": "turtleBlock",
                    "blockType": "command",
                    "text": "Ustaw blok żółwia [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
/*            {
                    "opcode": "turtleBlock",
                    "blockType": "command",
                    "text": "turtle pen block with id [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                        }
                    }
            },             */
            {
                    "opcode": "turtleThickness",
                    "blockType": "command",
                    "text": "Ustaw grubość pisaka na [n]",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": 1,
                        }
                    }
            },            
            {
                    "opcode": "setTurtlePosition",
                    "blockType": "command",
                    "text": "Teleportuj żółwia na (X: [x], Y: [y], Z: [z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "resetTurtleAngle",
                    "blockType": "command",
                    "text": "Resetuj kierunek żółwia na [n] stopni",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },            
            {
                    "opcode": "saveTurtle",
                    "blockType": "command",
                    "text": "Zapisz żółwia",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "restoreTurtle",
                    "blockType": "command",
                    "text": "Przywróć żółwia z zapisu",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "suspend",
                    "blockType": "command",
                    "text": "Przestań rysować",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "resume",
                    "blockType": "command",
                    "text": "Rysuj dalej",
                    "arguments": {
                    }
            },            
            ],
        "menus": {
            moveMenu: [{text:"przód",value:1}, {text:"tył",value:-1}],
            penMenu: [{text:"dół",value:1}, {text:"góra",value:0}],
            coordinateMenu: [{text:"x",value:0}, {text:"y",value:1}, {text:"z",value:2}],
            turnMenu: [ "odchylenie", "pochylenie", "przechylenie" ],
            modeMenu: [{text:"dokładnie",value:1},{text:"bloku",value:0}],
            entityMenu: ["Item",
                "XPOrb",
                "LeashKnot",
                "Painting",
                "Arrow",
                "Snowball",
                "Fireball",
                "SmallFireball",
                "ThrownEnderpearl",
                "EyeOfEnderSignal",
                "ThrownPotion",
                "ThrownExpBottle",
                "ItemFrame",
                "WitherSkull",
                "PrimedTnt",
                "FallingSand",
                "FireworksRocketEntity",
                "ArmorStand",
                "Boat",
                "MinecartRideable",
                "MinecartChest",
                "MinecartFurnace",
                "MinecartTNT",
                "MinecartHopper",
                "MinecartSpawner",
                "MinecartCommandBlock",
                "Mob",
                "Monster",
                "Creeper",
                "Skeleton",
                "Spider",
                "Giant",
                "Zombie",
                "Slime",
                "Ghast",
                "PigZombie",
                "Enderman",
                "CaveSpider",
                "Silverfish",
                "Blaze",
                "LavaSlime",
                "EnderDragon",
                "WitherBoss",
                "Bat",
                "Witch",
                "Endermite",
                "Guardian",
                "Pig",
                "Sheep",
                "Cow",
                "Chicken",
                "Squid",
                "Wolf",
                "MushroomCow",
                "SnowMan",
                "Ozelot",
                "VillagerGolem",
                "EntityHorse",
                "Rabbit",
                "Villager",
                "EnderCrystal",],
            blockMenu: { acceptReporters: true,
                items: [
                {text:"powietrze",value:"0,0"},
                {text:"łóżko",value:"26,0"},
                {text:"skała macierzysta",value:"7,0"},
                {text:"półka na książki",value:"47,0"},
                {text:"cegły",value:"45,0"},
                {text:"kaktus",value:"81,0"},
                {text:"dywan czarny",value:"171,15"},
                {text:"dywan niebieski",value:"171,11"},
                {text:"dywan brązowy",value:"171,12"},
                {text:"dywan błękitny",value:"171,9"},
                {text:"dywan szary",value:"171,7"},
                {text:"dywan zielony",value:"171,13"},
                {text:"dywan jasnoniebieski",value:"171,3"},
                {text:"dywan jasnoszary",value:"171,8"},
                {text:"limonka dywanowa",value:"171,5"},
                {text:"dywan w kolorze magenta",value:"171,2"},
                {text:"dywan pomarańczowy",value:"171,1"},
                {text:"dywan różowy",value:"171,6"},
                {text:"dywan fioletowy",value:"171,10"},
                {text:"dywan czerwony",value:"171,14"},
                {text:"dywan biały",value:"171"},
                {text:"dywan żółty",value:"171,4"},
                {text:"skrzynia",value:"54,0"},
                {text:"glina",value:"82,0"},
                {text:"blok węgla",value:"173,0"},
                {text:"Rudy węgla",value:"16,0"},
                {text:"bruk",value:"4,0"},
                {text:"pajęczyna",value:"30,0"},
                {text:"stół szemieślniczy",value:"58,0"},
                {text:"diamentowy blok",value:"57,0"},
                {text:"ruda diamentu",value:"56,0"},
                {text:"ziemia",value:"3,0"},
                {text:"żelazne drzwi",value:"71,0"},
                {text:"drewniane drzwi",value:"64,0"},
                {text:"podwójna trawa wysoka",value:"175,2"},
                {text:"pole uprawne",value:"60,0"},
                {text:"furtka",value:"107,0"},
                {text:"płot",value:"85,0"},
                {text:"ogień",value:"51,0"},
                {text:"kwiat cyjan",value:"38,0"},
                {text:"kwiat żółty",value:"37,0"},
                {text:"piec palący się",value:"62,0"},
                {text:"piec niepalący się",value:"61,0"},
                {text:"tafla szkła",value:"102,0"},
                {text:"szkło",value:"20,0"},
                {text:"blok blasku",value:"89,0"},
                {text:"złoty blok",value:"41,0"},
                {text:"Ruda złota",value:"14,0"},
                {text:"trawa wysoka",value:"31,0"},
                {text:"trawa",value:"2,0"},
                {text:"żwir",value:"13,0"},
                {text:"czarna utwardzona glina",value:"159,15"},
                {text:"niebieska utwardzona glina",value:"159,11"},
                {text:"brązowa utwardzona glina",value:"159,12"},
                {text:"cyjanowa utwardzona glina",value:"159,9"},
                {text:"szara utwardzona glina",value:"159,7"},
                {text:"zielona utwardzona glina",value:"159,13"},
                {text:"jasnoniebieska utwardzona glina",value:"159,3"},
                {text:"jasnoszara utwardzona glina",value:"159,8"},
                {text:"limonkowa utwardzona glina",value:"159,5"},
                {text:"magentowa utwardzona glina",value:"159,2"},
                {text:"pomarańczowa utwardzona glina",value:"159,1"},
                {text:"różowa utwardzona glina",value:"159,6"},
                {text:"fioletowa utwardzona glina",value:"159,10"},
                {text:"czerwona utwardzona glina",value:"159,14"},
                {text:"biała utwardzona glina",value:"159,0"},
                {text:"żółta utwardzona glina",value:"159,4"},
                {text:"lód",value:"79,0"},
                {text:"żelazny blok",value:"42,0"},
                {text:"Ruda żelaza",value:"15,0"},
                {text:"drabina",value:"65,0"},
                {text:"blok lapis lazuli",value:"22,0"},
                {text:"ruda lapis lazuli",value:"21,0"},
                {text:"duża paproć",value:"175,3"},
                {text:"płynąca lawa",value:"10,0"},
                {text:"lawa stacjonarna",value:"11,0"},
                {text:"liście brzozy",value:"18,6"},
                {text:"opuszcza dżunglę",value:"18,7"},
                {text:"liście dębu",value:"18,4"},
                {text:"liście świerkowe",value:"18,5"},
                {text:"odchodzi",value:"18,0"},
                {text:"liliowy",value:"175,1"},
                {text:"melon",value:"103,0"},
                {text:"kamień z mchu",value:"48,0"},
                {text:"pieczarkowy",value:"39,0"},
                {text:"czerwony grzyb",value:"40,0"},
                {text:"obsydian",value:"49,0"},
                {text:"piwonia",value:"175,5"},
                {text:"blok kwarcowy",value:"155,0"},
                {text:"blok czerwonego kamienia",value:"152,0"},
                {text:"aktywna lampa redstone",value:"124,0"},
                {text:"Lampa redstone nieaktywna",value:"123,0"},
                {text:"ruda czerwonego kamienia",value:"73,0"},
                {text:"krzak róży",value:"175,4"},
                {text:"piasek",value:"12,0"},
                {text:"piaskowiec",value:"24,0"},
                {text:"drzewko",value:"6,0"},
                {text:"latarnia morska",value:"169,0"},
                {text:"blok śniegu",value:"80,0"},
                {text:"śnieg",value:"78,0"},
                {text:"witraż czarny",value:"95,15"},
                {text:"niebieski witraż",value:"95,11"},
                {text:"witraż brązowy",value:"95,12"},
                {text:"witraż w kolorze cyjan",value:"95,9"},
                {text:"szary witraż",value:"95,7"},
                {text:"witraż zielony",value:"95,13"},
                {text:"jasnoniebieski witraż",value:"95,3"},
                {text:"jasnoszary witraż",value:"95,8"},
                {text:"witraż wapienny",value:"95,5"},
                {text:"witraż w kolorze magenta",value:"95,2"},
                {text:"pomarańczowy witraż",value:"95,1"},
                {text:"różowy witraż",value:"95,6"},
                {text:"fioletowy witraż",value:"95,10"},
                {text:"witraż czerwony",value:"95,14"},
                {text:"witraż biały",value:"95,0"},
                {text:"witraż żółty",value:"95,4"},
                {text:"schody brukowe",value:"67,0"},
                {text:"schody drewniane",value:"53,0"},
                {text:"Kamienna cegła",value:"98,0"},
                {text:"kamienny guzik",value:"77,0"},
                {text:"podwójna płyta kamienna",value:"43,0"},
                {text:"Kamienna płyta",value:"44,0"},
                {text:"kamień",value:"1,0"},
                {text:"trzcina cukrowa",value:"83,0"},
                {text:"słonecznik",value:"175,0"},
                {text:"TNT",value:"46,0"},
                {text:"pochodnia",value:"50,0"},
                {text:"płynąca woda",value:"8,0"},
                {text:"woda stacjonarna",value:"9,0"},
                {text:"przycisk drewna",value:"143,0"},
                {text:"deski",value:"5,0"},
                {text:"drewno",value:"17,0"},
                {text:"wełna czarna",value:"35,15"},
                {text:"wełniany niebieski",value:"35,11"},
                {text:"wełniany brąz",value:"35,12"},
                {text:"wełniany cyjan",value:"35,9"},
                {text:"wełniana szara",value:"35,7"},
                {text:"wełniana zieleń",value:"35,13"},
                {text:"wełna jasnoniebieska",value:"35,3"},
                {text:"jasnoszara wełna",value:"35,8"},
                {text:"wełniana limonka",value:"35,5"},
                {text:"wełniana magenta",value:"35,2"},
                {text:"wełniana pomarańcza",value:"35,1"},
                {text:"wełniany róż",value:"35,6"},
                {text:"fioletowy wełniany",value:"35,10"},
                {text:"wełniana czerwona",value:"35,14"},
                {text:"wełna biała",value:"35,0"},
                {text:"wełniana żółta",value:"35,4"} 
            ]            
            } 
            }
        };
    };
    
    parseXYZ(x,y,z) {
        var coords = [];
        if (typeof(x)=="string" && x.indexOf(",") >= 0) {
            return x.split(",").map(parseFloat);
        }
        else {
            return [x,y,z];
        }
    }

    blockByName({name}){
        return name;
    }
    
    sendAndReceive(msg) {
        var rjm = this;
        return new Promise(function(resolve, reject) {            
            rjm.socket.onmessage = function(event) {
                resolve(event.data.trim());
            };
            rjm.socket.onerror = function(err) {
                reject(err);
            };
            rjm.socket.send(msg);
        });
    };
    
    resume() {
        if (this.savedBlocks != null) {
            for (var [key, value] of this.savedBlocks)
                this.socket.send("world.setBlock("+key+","+value+")");
            this.savedBlocks = null;
        }
    };
    
    suspend() {
        if (this.savedBlocks == null) {
            this.savedBlocks = new Map();
        }
    }
    
    drawBlock(x,y,z,b) {
        if (this.savedBlocks != null) {
            this.savedBlocks.set(""+x+","+y+","+z, b);
        }
        else {
            this.socket.send("world.setBlock("+x+","+y+","+z+","+b+")");
        }
    };

    drawLine(x1,y1,z1,x2,y2,z2) {
        var l = this.getLine(x1,y1,z1,x2,y2,z2);
        
        for (var i=0; i<l.length ; i++) {
            this.drawBlock(l[i][0],l[i][1],l[i][2],this.turtle.block);
        }
    };
    
    turnTurtle({dir,n}) {
        if (dir=="prawo" || dir=="odchylenie") {/* Pause */
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));    
        }
        else if (dir=="nachylenie") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.pitchMatrix(n));    
        }
        else { // if (dir=="przechylenie") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.rollMatrix(n));    
        }
    };
    
    leftTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(-n));    
    }
    
    rightTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));
    }
    
    resetTurtleAngle({n}) {
        this.turtle.matrix = this.turtle.yawMatrix(n);
    };
    
    pen({state}) {
        this.turtle.penDown = state;
    }
    
    turtleBlock({b}) {
        this.turtle.block = b;
    }
    
    turtleBlockEasy({b}) {
        this.turtle.block = b;
    }
    
    setTurtlePosition({x,y,z}) {
        this.turtle.pos = this.parseXYZ(x,y,z);
    }
    
    turtleThickness({n}) {
        if (n==0) {
            this.turtle.nib = [];
        }
        else if (n==1) {
            this.turtle.nib = [[0,0,0]];
        }
        else if (n==2) {
            this.turtle.nib = [];
            for (var x=0; x<=1; x++) 
                for (var y=0; y<=1; y++) 
                    for (var z=0; z<=1; z++) 
                        this.turtle.nib.push([x,y,z]);
        }
        else {
            var r2 = n*n/4;
            var d = Math.ceil(n/2);
            this.turtle.nib = [];
            for (var x=-d; x<=d; x++) 
                for (var y=-d; y<=d; y++) 
                    for (var z=-d; z<=d; z++) 
                        if (x*x+y*y+z*z <= r2)
                            this.turtle.nib.push([x,y,z]);
        }
    }
    
    saveTurtle() {
        var t = this.turtle.clone();
        this.turtleHistory.push(t);
    }
    
    restoreTurtle() {
        if (this.turtleHistory.length > 0) {
            this.turtle = this.turtleHistory.pop();
        }
    }

    drawPoint(x0,y0,z0) {
        var l = this.turtle.nib.length;
        if (l == 0) {
            return;
        }
        else if (l == 1) {
            this.drawBlock(x0,y0,z0,this.turtle.block)
            return;
        }

        for (var i = 0 ; i < l ; i++) {
            var p = this.turtle.nib[i];
            var x = p[0] + x0;
            var y = p[1] + y0;
            var z = p[2] + z0;
            this.drawBlock(x,y,z,this.turtle.block)
        }
    };

    moveTurtle({dir,n}) {
        n *= dir;
        var newX = this.turtle.pos[0] + this.turtle.matrix[0][2] * n;
        var newY = this.turtle.pos[1] + this.turtle.matrix[1][2] * n;
        var newZ = this.turtle.pos[2] + this.turtle.matrix[2][2] * n;
        if (this.turtle.penDown != 0)
            this.drawLine(Math.round(this.turtle.pos[0]),Math.round(this.turtle.pos[1]),Math.round(this.turtle.pos[2]),Math.round(newX),Math.round(newY),Math.round(newZ));
        this.turtle.pos = [newX,newY,newZ];
    }; 
    
    getPosition() {
        return this.sendAndReceive("player.getPos()")
            .then(pos => {
                var p = pos.split(",");
                return [parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])];
            });
    };

    spawnEntity({entity,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z);
        return this.sendAndReceive("world.spawnEntity("+entity+","+x+","+y+","+z+")"); // TODO: do something with entity ID?
    };

    movePlayer({dx,dy,dz}) {
        var [x,y,z] = this.parseXYZ(dx,dy,dz);
        return this.getPosition().then(pos => this.setPlayerPos({x:pos[0]+x,y:pos[1]+y,z:pos[2]+z}));
    };

    movePlayerTop() {
        return this.getPosition().then(pos => 
            this.sendAndReceive("world.getHeight("+Math.floor(pos[0])+","+Math.floor(pos[2])+")").then(
                height => this.setPlayerPos({x:pos[0],y:height,z:pos[2]})));
    };

    getRotation() {
        return this.sendAndReceive("player.getRotation()")
            .then(r => {
                return parseFloat(r);
            });
    };
    
    getBlock({x,y,z}) {
        var pos = ""+this.parseXYZ(x,y,z).map(Math.floor);
        if (this.savedBlocks != null) {
            if (this.savedBlocks.has(pos)) {
                var b = this.savedBlocks.get(pos);
                if (b.indexOf(",")<0)
                    return ""+b+",0";
                else
                    return b;
            }
        }
        return this.sendAndReceive("world.getBlockWithData("+pos+")")
            .then(b => {
                return b;
            });
    };

    onBlock({b}) {
        return this.getPosition().then( pos => this.sendAndReceive("world.getBlockWithData("+Math.floor(pos[0])+","+Math.floor(pos[1]-1)+","+Math.floor(pos[2])+")")
                    .then( block => block == b ) );
    }

    haveBlock({b,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
        return this.sendAndReceive("world.getBlockWithData("+x+","+y+","+z+")")
            .then(block => {
                return block == b;
            });
    };
    
    getPlayerVector({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? ""+pos[0]+","+pos[1]+","+pos[2] : ""+Math.floor(pos[0])+","+Math.floor(pos[1])+","+Math.floor(pos[2]));
    };
    
    makeVector({x,y,z}) {
        return ""+x+","+y+","+z
    }
    
    getHit() {
        if (this.hits.length>0) 
            return ""+this.hits.shift().slice(0,3);
        var rjm = this;
        return this.sendAndReceive("events.block.hits()")
            .then(result => {
                if (result.indexOf(",") < 0) 
                    return "";
                
                else {
                    var hits = result.split("|");
                    for(var i=0;i<hits.length;i++)
                        rjm.hits.push(hits[i].split(",").map(parseFloat));
                }
                return ""+this.shift.pop().slice(0,3);
            });
    };

    extractFromVector({vector,coordinate}) {
        var v = vector.split(",");
        if (v.length <= coordinate) {
            return 0.;
        }
        else {
            return parseFloat(v[coordinate]);
        }
    };

    getPlayerX({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[0] : Math.floor(pos[0]));
    };

    getPlayerY({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[1] : Math.floor(pos[1]));
    };

    getPlayerZ({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[2] : Math.floor(pos[2]));
    };

    connect_p({ip}){
        this.ip = ip;
        var rjm = this;
        return new Promise(function(resolve, reject) {
            if (rjm.socket != null)
                rjm.socket.close();
            rjm.clear();
            rjm.socket = new WebSocket("ws://"+ip+":14711");
            rjm.socket.onopen = function() {                
                resolve();
            };
            rjm.socket.onerror = function(err) {
                reject(err);
            };
        }).then(result => rjm.getPosition().then( result => {
            rjm.turtle.pos = result;
        })).then (result => rjm.getRotation().then( result => {
            rjm.playerRot = result;
            rjm.turtle.matrix = rjm.turtle.yawMatrix(Math.floor(0.5+result/90)*90);
        }));
    };
    
    chat({msg}){
        this.socket.send("chat.post("+msg+")");
    };
    
    getLine(x1,y1,z1,x2,y2,z2) {
        var line = [];
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        z1 = Math.floor(z1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        z2 = Math.floor(z2);
        var point = [x1,y1,z1];
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = z2 - z1;
        var x_inc = dx < 0 ? -1 : 1;
        var l = Math.abs(dx);
        var y_inc = dy < 0 ? -1 : 1;
        var m = Math.abs(dy);
        var z_inc = dz < 0 ? -1 : 1;
        var n = Math.abs(dz);
        var dx2 = l * 2;
        var dy2 = m * 2;
        var dz2 = n * 2;
        
        var nib = this.turtle.nib;
        
        var draw = function(x,y,z) {
            for (var i=0; i<nib.length; i++) {
                var nx = x + nib[i][0];
                var ny = y + nib[i][1];
                var nz = z + nib[i][2];
                var j;
                for (j=0; j<line.length; j++) {
                    if (line[j][0] == nx && line[j][1] == ny && line[j][2] == nz)
                        break;
                }
                if (j<line.length)
                    continue;
                line.push([nx,ny,nz]);
            }
        };

        if (l >= m && l >= n) {
            var err_1 = dy2 - l;
            var err_2 = dz2 - l;
            for (var i=0; i<l; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dx2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dx2;
                }
                err_1 += dy2;
                err_2 += dz2;
                point[0] += x_inc;
            }
        }
        else if (m >= l && m >= n) {
            err_1 = dx2 - m;
            err_2 = dz2 - m;
            for (var i=0; i<m; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[0] += x_inc;
                    err_1 -= dy2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dy2;
                }
                err_1 += dx2;
                err_2 += dz2;
                point[1] += y_inc;
            }
        }
        else {
            err_1 = dy2 - n;
            err_2 = dx2 - n;
            for (var i=0; i < n; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dz2;
                }
                if (err_2 > 0) {
                    point[0] += x_inc;
                    err_2 -= dz2;
                }
                err_1 += dy2;
                err_2 += dx2;
                point[2] += z_inc;
            }
        }
        draw(point[0],point[1],point[2]);
        if (point[0] != x2 || point[1] != y2 || point[2] != z2) {
            draw(x2,y2,z2);
        }
        return line;
    };
    
    setBlock({x,y,z,b}) {
      var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
      this.drawBlock(x,y,z,b);
    };

    setPlayerPos({x,y,z}) {
      var [x,y,z] = this.parseXYZ(x,y,z);
      this.socket.send("player.setPos("+x+","+y+","+z+")");
    };
}

(function() {
    var extensionClass = RaspberryJamMod
    if (typeof window === "undefined" || !window.vm) {
        Scratch.extensions.register(new extensionClass())
    }
    else {
        var extensionInstance = new extensionClass(window.vm.extensionManager.runtime)
        var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
        window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
    }
})()

