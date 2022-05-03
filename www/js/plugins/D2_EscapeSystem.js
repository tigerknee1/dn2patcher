/*:
 * @plugindesc This plugin tracks the state of the escape system
 * @author Kendrian
 *
 * @help
 * This plugin has 3 files that control the Escape System in Didnapper 2.
 * In this first part, most of the main methods and references are.
 * In the second part, the graphics are handled (mainly character graphics).
 * The third part handles the code for the menu itself (buttons etc)
 */

class D2EscapeSystem {
    constructor() {
        // Set the default values
        //this.setup();
        Core.on("newGame", this.init.bind(this));
        Core.on("afterLoad", this.init.bind(this));
    }

    /**
     * Clears the escape system and reset everything to the default values
     */
    defaults() {
        this._ties = ["Chair","Basic","Hogtie","Frog","Suspension"];
        this._gags = ["None","Cleave","Knotted","OTM","OTN","Ball","AC"];
        this._bindings = ["None","Ropes","AC","Cuffs","Tape"];
        this._distractions = ["None","Ropes","AC"];
        this._blindfolds = ["None","Cloth"];
        this.items = {
			nail: {
				name: "Nail",
    			struggleBonus: 50,
    			description: "(The nail might help cut through bindings.)"
  			},
			wood: {
  				name: "Large splinter",
				struggleBonus: 100,
				description: "(The splinter might help cut through bindings.)"
			},
			rock: {
				name: "Sharp rock",
    			struggleBonus: 150,
    			description: "(The rock might help cut through bindings.)"
  			},
  			pin: {
				name: "Pin",
    			lockpickBonus: 1, //Affects lockpicking
    			description: "(The pin might help pick locks.)"
  			},
  			china: {
				name: "China shard",
    			struggleBonus: 200,
    			description: "(The china might help cut through bindings.)"
  			},
  			glass: {
				name: "Glass shard",
    			struggleBonus: 250,
    			description: "(The glass might help cut through bindings.)"
  			},
  			scissors: {
				name: "Scissors",
    			struggleBonus: 250,
    			description: "(The scissors may help cut through bindings.)"
  			},
  			knife: {
  				name: "Pocket knife",
				struggleBonus: 300,
				description: "(The knife might help cut through bindings.)"
			},
			dagger: {
  				name: "Dagger",
				struggleBonus: 350,
				description: "(The dagger might help cut through bindings.)"
			}
		};
        this._gainedItems = [];
        this._cellItems = [];
        this._alliesUnreachable = false;

        this.tie = {
            id : 0,
            name : this._ties[0]
        };
        this.gag = {
            tag : "gag",
            id : 1,
            name : this._gags[1],
            lvl : 1,
            display : "?",
            meter : 8000
        };
        this.blindfold = {
            tag : "blindfold",
            id : 0,
            name : this._blindfolds[0],
            lvl : 5,
            display : "?",
            meter : 8000
        };
        this.torso = {
            tag : "torso",
            id : 1,
            name : this._bindings[1],
            lvl : 5,
            display : "?",
            meter : 8000
        };
        this.legs = {
            tag : "legs",
            id : 1,
            name : this._bindings[1],
            lvl : 5,
            display : "?",
            meter : 8000
        };
        this.wrists = {
            tag : "wrists",
            id : 1,
            name : this._bindings[1],
            lvl : 5,
            display : "?",
            meter : 8000
        };
        this.hogtie = {
            tag : "hogtie",
            id : 1,
            name : this._bindings[1],
            lvl : 5,
            display : "?",
            meter : 8000
        };
        this.suspension = {
            tag : "suspension",
            id : 1,
            name : this._bindings[1],
            lvl : 5,
            display : "?",
            meter : 8000
        };
        this.distraction = {
            tag : "distraction",
            id : 1,
            name : this._distractions[1],
            meter : 2000
        };

        this._poleId = 0;

        this.guard = {
            name : "Guard",
            tyingSkill : 50,
            strictness : 5000,
            observation : 5000,
            minimumStrictness : 3000,
            assessed : false,
            items : []
        };

        this._timeLimit = true;
        this._timeLeft = 100;
        this._givenUp = false;
        this._oldTimeLeft = 0; //used to track whether time has passed while outside the menu
        this._inspectedSurroundings = false;
        this._soundproofness = 50;
        this._backgroundID = 0;
        this._difficulty = 0;
        this._difficultyName = "Undecided";

        this._availableTies = this._ties;
        this._availableGags = this._gags;
        this._availableBindings = this._bindings;
        this._availableDistractions = this._distractions;
        this._availableBlindfolds = this._blindfolds;
        this._availableItems = Object.keys(this.items);

        this._restraints = [this.wrists, this.legs, this.torso, this.gag, this.blindfold, this.distraction, this.hogtie, this.suspension];
        this._actions = [];
        this._dialogue = "";

        this._bodyFrame = 0;
        this._hairFrame = 0;
        if (!this._sameSetupCount) 
            this._sameSetupCount = 0;

        this._partyRescueLines =    [
                                    [""],["Thanks!","I owe you one!"], ["Thanks..."], 
                                    ["Thanks...","Took you long enough.","Let's just go.","I better not get ropeburn..."], //Aden
                                    ["Thank you~!","Phew!","Thanks! I was getting a little worried..."], //Eileen
                                    ["Thank you...","Thank you!","Let's get out of here."], //Chelsea
                                    [`Thanks, ${D2.partyLeader().name()}!`,"What would I do without you?"], //Liliana
                                    ["Thank you.","You have my thanks.","...","Not a word."], //Kaie
                                    ["I appreciate it.","That was embarrassing...","I almost got free by myself, you know...","Thanks. What do you say we get some payback now?"]
                                    ];

        this.customWinCondition = function(){return false};
        this.customLoseCondition = function(){return false};
        this._skipSuccess = false;
        this._Exceed = D2.partyLeader().equips()[2] ? D2.partyLeader().equips()[2].baseItemId == 50 : false; //If Seles is wearing the exceed

		this.resetComboCount();
		this.autoStruggle = false;
    }

    start(){
        //Run after custom setup is done
        this._started = true;
        this.update();
    }

    setup(escapeName){
        this._setupName = escapeName;
        this.defaults();
        if (this.isSameSetup()){
            this._sameSetupCount++;
        } else {
            //Also reset in PDX_NearbyEnemiesJoinBattle.js
            this._sameSetupCount = 0;
        }
        this.escapeCellSetup();
        this.updateDifficulty();
        this.start();
        //this._setupName = "";
    }

    setupName(){
        return this._setupName ? this._setupName : "";
    }

    previousSetup(){
        return this._previousSetup ? this._previousSetup : "";
    }

    updatePreviousSetup(){
        this._previousSetup = this.setupName();
    }

    isSameSetup(){
        return this.setupName() === this.previousSetup();
    }

    sameSetupCount(){
        return this._sameSetupCount;
    }

    updateDifficulty(){
        runExternalScript("Escape","EscapeDifficultyCalc.js");
    }

    hasStarted(){
        return this._started;
    }

    end(){
        this._previousSetup = this.setupName();
        this._started = false;
        $gameSystem.enableMenu();
    }

    init(){
        //This is only supposed to run once per game
        this._started = false;
        this.initCapturedAllies();
        this.defaults();
        this.update();
    }

    updateBlindfoldOpacity(){
        this._blindfoldOpacity = $gameVariables.value(164) != 1 ? 120 : 255; //If not set to opaque in options, make the blindfold transparent
    }

    update(){
        this.updateBlindfoldOpacity();
        this.updatePlayer();
    }

    inspectDisabled(){
        return this.isBlindfolded();
    }

    assessDisabled(){
        return this.isBlindfolded();
    }

    torsoSelectionDisabled(){
        return this.torso.meter <= 0;
    }

    legsSelectionDisabled(){
        return this.legs.meter <= 0;
    }

    gagSelectionDisabled(){
        return !this.isGagged();
    }

    blindfoldSelectionDisabled(){
        return !this.isBlindfolded();
    }

    distractionSelectionDisabled(){
        return !this.hasDistraction();
    }

    minMax(num, min, max){
        return Math.min(Math.max(num, min), max);
    }

    percentageString(value, max){
        return Math.floor((value / max) * 100) + "%";
    }

    objectListToString(object){
        let string = "";
        let list = [];
        let list2 = [];
        let count = 0;
        for (i = 0; i < object.length; i++){
            list.push(object[i].name);
        }
        list.sort()
        for (i = 0; i < list.length; i++){
            count++;
            if (list[i] != list[i+1]){
                if (count > 1) list[i] += " x"+count;
                list2.push(list[i]);
                count = 0;
            }
        }
        for (i = 0; i < list2.length; i++){
            if (i+1 == list2.length && list2.length > 1) {
                string += " and ";
            } else if (i != 0) {
                string += ", ";
            }
            string += list2[i];
        }
        return string;
    }

    limitRestraintMeter(restraint, max){
        restraint.meter = this.minMax(restraint.meter, 0, max);
    }

    escapeLvl(){
        return this.captive ? this.captive._escapeLvl : 0;
    }

    setEscapeLvl(value){
        this.captive._escapeLvl = this.minMax(value, 1, 100);
    }

    expThreshold(){
        return 10000;
    }

    expPercentage(){
        return Math.floor((this.escapeExp()/this.expThreshold())*100);
    }

    escapeExp(){
        return this.captive._escapeExp;
    }

    setEscapeExp(value){
        this.captive._escapeExp = Math.round(Math.max(value, 0));
        const oldLvl = this.escapeLvl();
        const lvlIncrease = Math.floor(value / this.expThreshold());
        if (lvlIncrease > 0) {
            //Level up
            this.setEscapeLvl(oldLvl + lvlIncrease);
            this.captive._escapeExp -= (this.expThreshold() * lvlIncrease);
            this.lvlUpMessage = "Escape level increased from "+oldLvl+" to "+this.escapeLvl()+"!";
        }
    }

    gainEscapeExp(value){
        //console.log("Gained "+value+" exp")
        this.setEscapeExp(this.escapeExp() + value);
    }

    successfulEscapeExp(){
        const penalty = this.setupName() === "Camp" ? 0.75 : 1; //Less exp in the camp
        this.gainEscapeExp(this._difficulty * 100 * ((101 - this.escapeLvl())/10) * penalty);
    }

    captiveRealName(){
        return this._captiveRealName;
    }

    captiveID(){
        return this._captiveID;
    }

    timeLeft(){
        return this._timeLeft;
    }

    timeLimit(){
        return this._timeLimit;
    }

    soundproofness(){
        return this._soundproofness;
    }

    canMove(){
        return !(["Hogtie","Suspension"].includes(this.tie.name) || (this.tie.name == "Chair" && this.torso.meter > 0) || this.hasPole() || (this.tie.name == "Frog" && this.legs.meter > 0));
    }

    setGag(gag){
        if (!this.gagIsAvailable(gag)){
            return;
        }
        if (typeof gag === 'string'){
            this.gag.name = gag;
            this.gag.id = this._gags.indexOf(gag);
        } else {
            this.gag.id = gag;
            this.gag.name = this._gags[gag];
        }
        if (this.gag.name == "AC"){ //AC gag progress is always full and lvl 10 while on
            this.setLvl(this.gag, 10);
            this.setMeter(this.gag, 10000);
        };
        if (!this.hasGag()) {
            this.setMeter(this.gag, 0); //If there's no gag, set gag progress to 0
        }; 
    }

    setTie(tie){
        if (!this.tieIsAvailable(tie)){
            return;
        }
        if (typeof tie === 'string'){
            this.tie.name = tie;
            this.tie.id = this._ties.indexOf(tie);
        } else {
            this.tie.id = tie;
            this.tie.name = this._ties[tie];
        }
        if (this.tie.name == "Hogtie"){
            this.setBinding(this.torso, this.hogtie.name);
            this.setBinding(this.legs, this.hogtie.name);
        }
        if (this.tie.name == "Suspension"){
            this.setBinding(this.hogtie, this.suspension.name);
            this.setBinding(this.torso, this.suspension.name);
            this.setBinding(this.legs, this.suspension.name);
            this.setDistraction(this.suspension.name); //Suspension always has a crotch rope of the same type
        }
        if (!this.tieAllowsPole()){
            this.setPole(0);
        }
        $gameVariables.setValue(41, this.tie.id); // Escape tie ID game variable is used for stuff like the return point sprite etc
    }

    setDistraction(distraction){
        if (!this.distractionIsAvailable(distraction)){
            return;
        }
        if (typeof distraction === 'string'){
            this.distraction.name = distraction;
            this.distraction.id = this._distractions.indexOf(distraction);
        } else {
            this.distraction.id = distraction;
            this.distraction.name = this._distractions[distraction];
        }
        if (!this.hasDistraction()){
            this.distraction.meter = 0;  //If there's no crotchrope, empty the meter
            };
    }

    setBinding(restraint, binding){
        //restraint can for example be this.torso or this.distraction, and binding can be for example 1 or "AC"
        if (!this.bindingIsAvailable(binding)){
            return;
        }
        if (typeof binding === 'string'){
            restraint.name = binding;
            restraint.id = this._bindings.indexOf(binding);
        } else {
            restraint.id = binding;
            restraint.name = this._bindings[binding];
        }
    }

    setAllBindings(binding){
        if (binding == "None" || binding == 0) binding = "Ropes";
        this.setBinding(this.torso, binding);
        this.setBinding(this.legs, binding);
        this.setBinding(this.wrists, binding);
        this.setBinding(this.hogtie, binding);
        this.setBinding(this.suspension, binding);
        if (this.hasDistraction()) this.setBinding(this.distraction, binding);
    }

    setBlindfold(blindfold){
        if (!this.blindfoldIsAvailable(blindfold)){
            return;
        }
        if (typeof blindfold === 'string'){
            this.blindfold.name = blindfold;
            this.blindfold.id = this._blindfolds.indexOf(blindfold);
        } else {
            this.blindfold.id = blindfold;
            this.blindfold.name = this._blindfolds[blindfold];
        }
        if (!this.isBlindfolded()) {
            this.blindfold.meter = 0; //If there's no blindfold, set blindfold progress to 0
        };
    }

    setSoundproofness(value){
        this._soundproofness = this.minMax(value, 0, 100);
    }

    setGuardTyingSkill(value){
        this.guard.tyingSkill = this.minMax(value, 0, 100);
    }

    setGuardName(value){
        this.guard.name = value.toString();
    }

    setGuardStrictness(min, current = min){
        this.guard.minimumStrictness = this.minMax(min, 0, 10000);
        this.guard.strictness = this.minMax(current, this.guard.minimumStrictness, 10000);
    }

    reduceGuardStrictness(amount){
        const oldStrictness = this.percentageString(this.guard.strictness, 10000);
        this.setGuardStrictness(this.guard.minimumStrictness, this.guard.strictness - amount);
        const newStrictness = this.percentageString(this.guard.strictness, 10000);
        if (newStrictness != oldStrictness)
            this.messages([`Guard strictness: ${oldStrictness} → ${newStrictness}`]);
    }

    increaseGuardStrictness(amount){
        const oldStrictness = this.percentageString(this.guard.strictness, 10000);
        this.setGuardStrictness(this.guard.minimumStrictness, this.guard.strictness + amount);
        const newStrictness = this.percentageString(this.guard.strictness, 10000);
        if (newStrictness != oldStrictness)
            this.messages([`Guard strictness: ${oldStrictness} → ${newStrictness}`]);
    }

    canAssessGuard(){
        return !this.isBlindfolded();
    }

    guardAssessed(){
        return !!this.guard.assessed;
    }

    assessTakesTime(){
        return !(this.guardAssessed() || this.perkPeoplePerson());
    }

    setGuardObservation(value){
        this.guard.observation = this.minMax(value, 0, 10000);
    }

    setMeter(restraint, value){
        restraint.meter = this.minMax(Math.floor(value), 0, 10000);
    }

    increaseMeter(restraint, amount){
        this.setMeter(restraint, restraint.meter + amount);
    }

    reduceMeter(restraint, amount){
        this.setMeter(restraint, restraint.meter - amount);
    }

    blushOpacity(){
        return this.minMax((this.distraction.meter / 10000) * 255, 0, 255); 
    }

    setLvl(restraint, value){
        restraint.lvl = this.minMax(value, 1, 10);
        if (restraint.tag == "gag" && restraint.name == "AC") restraint.lvl = 10; //AC gag is always lvl 10
    }

    increaseLvl(restraint, amount){
        this.setLvl(restraint, restraint.lvl + amount);
    }

    reduceLvl(restraint, amount){
        this.setLvl(restraint, restraint.lvl - amount);
    }

    setTimeLimit(value){
        this._timeLimit = value;
        if (!value) {
            this._timeLeft = 9999999;
        }
    }

    setDisplay(restraint, display){
        restraint.display = display;
    }

    revealLvl(restraint){
        restraint.display = restraint.lvl;
    }

    hideLvl(restraint){
        restraint.display = "?";
    }

    lvlIsHidden(restraint){
        return restraint.display != restraint.lvl;
    }

    setTimeLeft(value){
        this._timeLeft = Math.max(value, 0);
    }

    reduceTimeLeft(amount){
        this.setTimeLeft(this.timeLeft() - amount);
    }

    increaseTimeLeft(amount){
        this.setTimeLeft(this.timeLeft() + amount);
    }

    setBackground(id){
        this._backgroundID = id;
    }

    isGagged(){
        return this.gag.meter > 0 && this.hasGag();
    }

    hasGag(){
        return this.gag.id > 0;
    }

    isBlindfolded(){
        return this.blindfold.meter > 0 && this.hasBlindfold();
    }

    hasBlindfold(){
        return this.blindfold.id > 0;
    }

    hasDistraction(){
        return this.distraction.id > 0;
    }

    hasACPenalty(){
        return this.ACCount() > 0;
    }

    ACCount(){
        let count = 0;
        for (i = 0; i < this._restraints.length; i++){
            if (this._restraints[i].name === "AC" && this._restraints[i].meter > 0 && !["hogtie","suspension"].includes(this._restraints[i].tag)) {
                count++;
            }
        }
        return count;
    }

    hasPole(){
        return this._poleId > 0;
    }

    setPole(id){
        this._poleId = this.tieAllowsPole() ? id : 0;
    }

    tieAllowsPole(){
        return ["Basic","Frog"].includes(this.tie.name);
    }

    setRandomPole(){
        if (this.tieAllowsPole()){
            this.setPole(Core.randomInt(0,1))
        }
    }

    torsoIsBound(){
        return this.torso.meter > 0;
    }

    inspectedSurroundings(){
        return this._inspectedSurroundings;
    }

    gagIsAvailable(gag){
        if (typeof gag === 'number'){
            gag = this._gags[gag];
        }
        return this._availableGags.includes(gag);
    }

    tieIsAvailable(tie){
        if (typeof tie === 'number'){
            tie = this._ties[tie];
        }
        return this._availableTies.includes(tie);
    }

    bindingIsAvailable(bindings){
        if (typeof bindings === 'number'){
            bindings = this._bindings[bindings];
        }
        return this._availableBindings.includes(bindings);
    }

    distractionIsAvailable(distraction){
        if (typeof distraction === 'number'){
            distraction = this._distractions[distraction];
        }
        return this._availableDistractions.includes(distraction);
    }

    blindfoldIsAvailable(blindfold){
        if (typeof blindfold === 'number'){
            blindfold = this._blindfolds[blindfold];
        }
        return this._availableBlindfolds.includes(blindfold);
    }

    isFree(){
        return this.wrists.meter <= 0;
    }

    isGameOver(){
        return ((this.timeLimit() && this.timeLeft() <= 0) || this._givenUp || this.customLoseCondition());
    }

	comboCount(){
		return this.combo;
	}

	incrementComboCount(){
		this.combo++;
	}

	resetComboCount(){
		this.combo = 0;
	}

	toggleAutoStruggle(){
		this.autoStruggle = !this.autoStruggle;
	}

    //==============================================================//
    //                     OVERWORLD ACTIONS                        //
    //==============================================================//

    callGuardSoundCheck(){
        const gagPenalty = this.isGagged() ? this.gag.lvl * Core.randomInt(1,5) : 0;
        return Core.randomInt(0,99) - gagPenalty >= this.soundproofness();
    }

    allyCommunicationCheck(){
        if (!this.isGagged()) return true;
        if (!this.perkFluentInGag() || Core.randomInt(0,1) === 0) {
            return this.gag.lvl < Core.randomInt(1,10); // 90-0%  
        } else {
            return this.gag.lvl < Core.randomInt(1,10) || this.gag.lvl < Core.randomInt(1,10);  // 99%-0%
        }
    }

    guardCharmCheck(){
        return Core.randomInt(0,10000) > this.guard.strictness;
    }

    guardPleadCheck(){
        return Core.randomInt(0,10000) > this.guard.strictness;
    }

    guardGaggedPleaCheck(){
        return Core.randomInt(0,10000) - (this.gag.lvl * 300) > this.guard.strictness;
    }

    guardThreatenCheck(){
        return Core.randomInt(0,10000) > this.guard.strictness;
    }

    tightenRestraint(restraint){
        //restraint can be for example this.gag or this.torso
        if (this.perkNotAgain() && restraint.meter <= 0 && Core.randomInt(0,3) == 0) this.reduceLvl(restraint, 1); //25% chance of lowering new restraint lvl with perk
        const oldMeterValue = this.percentageString(restraint.meter, 10000);
        this.setMeter(restraint, this.tightenValue(restraint));
        const newMeterValue = this.percentageString(restraint.meter, 10000);
        this._changeString = `${oldMeterValue} → ${newMeterValue}`;
    }

    tightenValue(restraint){
        return restraint.meter + (this.guard.tyingSkill*100 + 10000 - restraint.meter) / 2;
    }

    willTighten(restraint){
        return restraint.meter < this.tightenValue(restraint);
    }

    guardLoosen(restraint){
        const oldMeterValue = this.percentageString(restraint.meter, 10000);
        restraint.meter *= 2 / 3;
        const newMeterValue = this.percentageString(restraint.meter, 10000);
        this._changeString = `${oldMeterValue} → ${newMeterValue}`;
    }

    canLoosen(restraint){
        return restraint.meter > 0;
    }

    allyLoosen(restraint){
        const oldMeterValue = this.percentageString(restraint.meter, 10000);
        restraint.meter *= ((restraint.lvl * 3) + Core.randomInt(40,70)) / 100;
        const newMeterValue = this.percentageString(restraint.meter, 10000);
        this._changeString = `${oldMeterValue} → ${newMeterValue}`;
    }

    suspensionLoosen(){
        this.setMeter(this.suspension, this.suspension.meter - (10000 - this.guard.strictness));
    }

    tightenCheck(restraint){
        return this.guard.observation > restraint.meter && this.willTighten(restraint);
    }

    canAssault(){
    	return ((this.perkAggressiveAcrobatics() && this.tie.name != "Frog")  || this.legs.meter <= 0) && !["Hogtie","Suspension"].includes(this.tie.name)
    }

    messages(messages){
        while (messages.length > 0){
            CallPluginCommand(`Notify: ${messages[0]}`);
            messages.shift();
        }
    }

    actions(){
        this._actions = this._actions.map(v => v.toLowerCase());
        this._actions = [...new Set(this._actions)]; //Remove duplicates
        let messages = []; //Messages that appear in the bottom left corner

        switch (this._actions[0]) {
            case "blindfold":
                if (this.isBlindfolded()){ //if blindfolded
                    if (this.tightenCheck(this.blindfold)) {
                        this.tightenRestraint(this.blindfold);
                        messages.push(`Blindfold: ${this._changeString}`);
                    }
                } else {
                    this.setBlindfold(1) //blindfold on
                    this.tightenRestraint(this.blindfold);
                    messages.push("Blindfold added");
                }
                break;

            case "gag":
                if (!this.isGagged()){ //gag progress is 0
                    messages.push("Gag added");
                }
                if (!this.hasGag()){ //If no gag type
                    this.setGag(1); //Set to cleave
                } else {
                    if (Core.randomInt(0, 2) == 0 && this.gagIsAvailable(this.gag.id + 1)){ //If the next type of gag is available
                        this.setGag(this.gag.id + 1); //Increase gag type by 1
                        this.increaseLvl(this.gag, 1); //Increase gag level by 1
                        this.hideLvl(this.gag); //Hide gag level from player
                        if (messages.length < 1){
                            messages.push(`Gag changed to: ${this.gag.name} gag`);
                        }
                    }
                }
                if (messages.length < 1 && this.willTighten(this.gag)){
                    this.tightenRestraint(this.gag);
                    messages.push(`Gag: ${this._changeString}`);
                } else {
                    this.tightenRestraint(this.gag);
                }
                break;

            case "ungag":
                if (this.isGagged()){ //if gagged, remove it
                    messages.push("Gag removed");
                    this.setMeter(this.gag, 0);
                }
                break;

            case "unblindfold":
                if (this.isBlindfolded()){ //if blindfolded, remove it
                    messages.push("Blindfold removed");
                    this.setMeter(this.blindfold, 0);
                }
                break;

            case "tighten":
                switch (this.tie.name){
                    case "Suspension":
                        if (!this.tightenCheck(this.suspension))
                            break;
                        this.tightenRestraint(this.suspension);
                        messages.push(`Suspension bindings: ${this._changeString}`);
                        break;
                    case "Hogtie":
                        if (this.tightenCheck(this.hogtie)){ //If connection progress is less than strictness
                            this.tightenRestraint(this.hogtie);
                            messages.push(`Connection rope: ${this._changeString}`);
                        }
                        if (this.tieIsAvailable("Suspension") && Core.randomInt(0, 2) == 0){ //Suspension is possible
                            //messages.push("Tie upgraded");
                            this.setTie("Suspension");
                            this.tightenRestraint(this.suspension);
                            this.setLvl(this.suspension, this.guard.tyingSkill / 10);
                            this.hideLvl(this.suspension);
                            messages.push(`Tie changed to: ${this.tie.name}`);
                        }
                        break;
                    case "Basic":
                        if (!this.hasPole() && this.tieIsAvailable("Hogtie") && Core.randomInt(0, 2) == 0){ //1/3 chance to upgrade to hogtie
                            this.setTie("Hogtie");
                            this.tightenRestraint(this.hogtie);
                            this.setLvl(this.hogtie, this.guard.tyingSkill / 10);
                            this.hideLvl(this.hogtie);
                            messages.push(`Tie changed to: ${this.tie.name}`);
                        }
                        break;
                }
                //Common tightens
                if (this.tightenCheck(this.wrists)){
                    this.tightenRestraint(this.wrists);
                    messages.push(`Wrist bindings: ${this._changeString}`);
                }
                if (this.tightenCheck(this.legs)){
                    if (this.legs.meter > 0){
                        this.tightenRestraint(this.legs);
                        messages.push(`Leg bindings: ${this._changeString}`);
                    } else {
                        this.tightenRestraint(this.legs);
                        messages.push("Leg bindings added");
                    }
                }
                if (this.tightenCheck(this.torso)){
                    if (this.torso.meter > 0){
                        this.tightenRestraint(this.torso);
                        messages.push(`Torso bindings: ${this._changeString}`);
                    } else {
                        this.tightenRestraint(this.torso);
                        messages.push("Torso bindings added");
                    }
                }
                if (this.confiscateCheck()){
                	this.guardConfiscates();
                }
                break;
            case "loosen":
                this.guardLoosen(this.wrists)
                messages.push(`Wrist bindings: ${this._changeString}`);
                if (this.canLoosen(this.legs)){
                    this.guardLoosen(this.legs);
                    messages.push(`Leg bindings: ${this._changeString}`);
                }
                if (this.canLoosen(this.torso)){
                    this.guardLoosen(this.torso);
                    messages.push(`Torso bindings: ${this._changeString}`);
                }
                if (this.tie.name == "Hogtie"){
                    this.guardLoosen(this.hogtie);
                    messages.push(`Connection rope: ${this._changeString}`);
                }
                if (this.tie.name == "Suspension"){
                    this.reduceMeter(this.suspension, 10000 - this.guard.strictness);
                    if (this.suspension.meter > 0){
                        messages.push("Suspension adjusted");
                    } else {
                        this.setTie("Hogtie");
                        messages.push(`Tie changed to: ${this.tie.name}`);
                    }
                }
                break;
            case "allyloosen":
                if (this.tie.name == "Suspension"){
                    messages.push("All knots are out of reach");
                } else {
                    this.allyLoosen(this.wrists);
                    messages.push(`Wrist bindings: ${this._changeString}`);
                    if (this.canLoosen(this.legs)){
                        this.allyLoosen(this.legs);
                        messages.push(`Leg bindings: ${this._changeString}`);
                    }
                    if (this.canLoosen(this.torso)){
                        this.allyLoosen(this.torso);
                        messages.push(`Torso bindings: ${this._changeString}`);
                    }
                    if (this.tie.name == "Hogtie"){
                        this.allyLoosen(this.hogtie);
                        messages.push(`Connection rope: ${this._changeString}`);
                    }
                }
                break;
        }
        this.messages(messages);
        this._actions.shift();
        this.updatePlayer();
    }

	//==============================================================//
    //                          ITEMS                               //
    //==============================================================//

    gainItem(item){
    	if (typeof item === 'string'){
    		this._gainedItems.push(this.items[item]);
    	} else {
    		this._gainedItems.push(item);
    	}
    	this.updateItemHud();
    }

    getItemIndex(list, item){
    	for( var i = 0; i < list.length; i++){                       
        	if (list[i] === item) { 
            	return i;
        	}
    	}
    }

    gainGuardItem(){
    	if (this.guardHasItem()){
    		let item = Core.randomInArray(this.guard.items);
    		this.gainItem(item);
    		this.messages([`${this.guard.name} dropped: ${item.name}`]);
    		this.removeGuardItem(item);
    	} else {
    		this.messages([`${this.guard.name} has no item to drop.`]);
    	}
    }

    gainCellItem(i){
    	let item = this.items[this._cellItems[i]];
    	if (!!item) {
    		this.gainItem(item);
    		this.messages([`You found: ${item.name}`]);
    		this._cellItems[i] = false;
    	} else {
    		this.messages(["No item, or it's already taken"]);
    	}
    }

    assaultDrop(){
        const chanceMax = this.perkPenaltyKicker() ? 200 : 100;
    	if (this.canAssault() && Core.randomInt(1,chanceMax) >= 35+(15*D2.difficulty())){ //20~50% chance
    		if (this.legs.meter > 0 && Core.randomInt(0,1) === 0) return; //50% of fail here if legs are still tied
            this.gainGuardItem();
    		return;
    	}
    	this.messages(["No item was dropped"]);
    }

    setCellItems(array){
    	this._cellItems = array;
    }

    setShuffledCellItems(array){
    	this._cellItems = Core.shuffleArray(array);
    }

    canConfiscate(){
    	return this._gainedItems.length > 0;
    }

    confiscateCheck(){
        if (!this.canConfiscate()) return false;
        const chance = this.perkDiscreetOwner() ? Core.randomInt(0, 30000) : Core.randomInt(0, 20000);
    	return this.guard.observation > chance;
    }

    guardConfiscates(){
    	let i = Core.randomInt(0, this._gainedItems.length - 1);
		let item = this._gainedItems[i];
		this.messages([`Item confiscated: ${item.name}`]);
		this.giveGuardItem(item);
		this._gainedItems.splice(i, 1);
		this.updateItemHud();
    }

    setRandomCellItems(amount = Core.randomInt(0,4)){
    	let list = [];
    	amount = this.minMax(amount, 0, 4); //must be between 0 and 4 items in the cell
    	while (list.length < amount){
    		if (Core.randomInt(0,1) == 0){ //50% chance of no item in the slot
    			list.push(Core.randomInArray(this._availableItems));
    		} else {
    			list.push(false);
    		}
    	}
    	this.setCellItems(list);
    }

    setGuardItems(items){
    	this.guard.items = [];
    	for (i = 0; i < items.length; i++){
        	this.guard.items.push(this.items[items[i]]);
    	}
    }

    giveGuardItem(item){
    	if (typeof item === 'string'){
    		this.guard.items.push(this.items[item])	;
    	} else {
    		this.guard.items.push(item);
    	}
    }

    removeGuardItem(item){
    	this.guard.items.splice(this.getItemIndex(item), 1);
    }

    setRandomGuardItems(amount = Core.randomInt(4)){
    	this.guard.items = [];
    	for (i = 0; i < amount; i++){
        	if (Core.randomInt(0, 1) == 0){
        		this.guard.items.push(this.items[Core.randomInArray(this._availableItems)]);
        	}
    	}
    }

   	guardHasItem(){
   		return this.guard.items.length > 0;
	}

	playerHasItem(){
		return this._gainedItems.length > 0;
	}

	cellHasAnItem(){
    	for (i = 0; i < this._cellItems.length; i++){
        	if (!!this._cellItems[i]){
            	return true;
        	}
    	}
    	return false;
	}

	checkCellItem(i){
		return !!this._cellItems[i];
	}

	findItem(i){
		EscapeSystem.reduceTimeLeft(1)
		if (!this.perkCarefulFumbler() && this.isBlindfolded() && Core.randomInt(0,1) == 0 && this.checkCellItem()){
			this._cellItems[i] = false;
			this.messages(["The item fell out of reach"]);
			return;
		}
		this.gainCellItem(i);
	}

	getItemStruggleBonuses(){
		let list = [];
		for (i = 0; i < this._gainedItems.length; i++) {
  			if (!!this._gainedItems[i].struggleBonus){
  				list.push(this._gainedItems[i].struggleBonus);
  			}
		}
    	if (list.length < 1) {
    		return [0];
    	}
    	return list;
	}

	//=============Other===============//

    captureParty() {
        for (const actor of $gameParty.members()){
            if (actor != $gameParty.members()[0]){ //if not party leader
                this.capturedAllies()[actor._actorId] = actor._actorId;
                //$gameVariables.setValue(actor._actorId+173, 'Captured'); //probably redundant later
                //$gameVariables.setValue(133+actor._actorId, actor._actorId);
                $gameParty.removeActor(actor._actorId);
                actor.addState(50);
                actor.addState(51);
            }
        }
    }

    rescueAlly(id) {
        D2.untieActor(id);
        //$gameVariables.setValue(133+id, 0); //Set ally ID value to 0
        //$gameVariables.setValue(id+173, 0); //Set actor captured state to 0
        $gameParty.addActor(id);
        this.capturedAllies()[id] = 0;
    }

    capturedAlliesCount() {
        let count = 0;
        for (const ally of this.capturedAllies()) { //For each capturable party ally
            if (ally > 0) count++; //If ally is captured in an escape sequence
        }
        return count;
        /*
        for (i = 176; i <= 180; i++) { //For each capturable party ally
            if ($gameVariables.value(i) == 'Captured') count++; //If ally is captured in an escape sequence
        }*/
    }

    capturedAllies() {
        return $gameVariables.value(135);
    }

    initCapturedAllies() {
        if (!Array.isArray($gameVariables.value(135))) 
            $gameVariables.setValue(135, [0,0,0,0,0,0,0,0,0]);        
    }

    randomizeMeters(min = 0, max = 10000){
        this.setMeter(this.gag, Core.randomInt(min, max));
        this.setMeter(this.blindfold, Core.randomInt(min, max));
        this.setMeter(this.wrists, Core.randomInt(min, max));
        this.setMeter(this.legs, Core.randomInt(min, max));
        this.setMeter(this.torso, Core.randomInt(min, max));
        this.setMeter(this.hogtie, Core.randomInt(min, max));
        this.setMeter(this.suspension, Core.randomInt(min, max));
        this.setMeter(this.distraction, Core.randomInt(min, max));
    }

    randomizeLvls(min = 1, max = 10){
        this.setLvl(this.blindfold, Core.randomInt(min, max));
        this.setLvl(this.wrists, Core.randomInt(min, max));
        this.setLvl(this.legs, Core.randomInt(min, max));
        this.setLvl(this.torso, Core.randomInt(min, max));
        this.setLvl(this.hogtie, Core.randomInt(min, max));
        this.setLvl(this.suspension, Core.randomInt(min, max));
    }

    randomizeRestraints(){
        this.setTie(this._availableTies[Core.randomInt(0, this._availableTies.length - 1)]);
        this.setGag(this._availableGags[Core.randomInt(0, this._availableGags.length - 1)]);
        this.setBlindfold(Core.randomInt(0, this._availableBlindfolds.length - 1));
        this.setDistraction(Core.randomInt(0, this._availableDistractions.length - 1));
        this.setAllBindings(this._availableBindings[Core.randomInt(0, this._availableBindings.length - 1)]);
    }

    saveCampSettings(){
        $gameSystem.persistentPluginsData.campEscapeSettings = {
            tieID: this.tie.id,
            timeLimit: this.timeLimit(),
            timeLeft: this.timeLeft(),
            soundproofness: this.soundproofness(),
            poleID: this._poleId,
            gagID: this.gag.id,
            blindfoldID: this.blindfold.id,
            cellItems: this._cellItems,
            bindings: this.wrists.id,

            guardTyingSkill: this.guard.tyingSkill,
            guardStrictness: this.guard.strictness,
            guardMinimumStrictness: this.guard.minimumStrictness,
            guardObservation: this.guard.observation,

            gagMeter: this.gag.meter,
            blindfoldMeter: this.blindfold.meter,
            legsMeter: this.legs.meter,
            torsoMeter: this.torso.meter,
            wristsMeter: this.wrists.meter,
            distractionMeter: this.distraction.meter,
            hogtieMeter: this.hogtie.meter,
            suspensionMeter: this.suspension.meter,
            gagLvl: this.gag.lvl,
            blindfoldLvl: this.blindfold.lvl,
            legsLvl: this.legs.lvl,
            torsoLvl: this.torso.lvl,
            wristsLvl: this.wrists.lvl,
            hogtieLvl: this.hogtie.lvl,
            suspensionLvl: this.suspension.lvl
        };
    }

    loadCampSettings(){
        if ($gameSystem.persistentPluginsData.campEscapeSettings === undefined) return;
        const settings = $gameSystem.persistentPluginsData.campEscapeSettings;
        this.setMeter(this.gag, settings.gagMeter);
        this.setMeter(this.blindfold, settings.gagMeter);
        this.setMeter(this.legs, settings.legsMeter);
        this.setMeter(this.torso, settings.torsoMeter);
        this.setMeter(this.wrists, settings.wristsMeter);
        this.setMeter(this.distraction, settings.distractionMeter);
        this.setMeter(this.hogtie, settings.hogtieMeter);
        this.setMeter(this.suspension, settings.suspensionMeter);
        this.setLvl(this.gag, settings.gagLvl);
        this.setLvl(this.blindfold, settings.blindfoldLvl);
        this.setLvl(this.legs, settings.legsLvl);
        this.setLvl(this.torso, settings.torsoLvl);
        this.setLvl(this.wrists, settings.wristsLvl);
        this.setLvl(this.hogtie, settings.hogtieLvl);
        this.setLvl(this.suspension, settings.suspensionLvl);
        this.setTie(settings.tieID);
        this.setTimeLeft(settings.timeLeft);
        this.setTimeLimit(settings.timeLimit);
        this.setPole(settings.poleID);
        this.setGag(settings.gagID);
        this.setBlindfold(settings.blindfoldID);
        this.setSoundproofness(settings.soundproofness);
        this.setGuardTyingSkill(settings.guardTyingSkill);
        this.setGuardStrictness(settings.guardMinimumStrictness, settings.guardStrictness);
        this.setGuardObservation(settings.guardObservation);
        this.setCellItems(settings.cellItems);
        this.setAllBindings(settings.bindings);
    }

    defaultCampSettings(){
        $gameSystem.persistentPluginsData.campEscapeSettings = undefined;
        EscapeSystem.setup("Camp");
    }

    logValues(restraint){
        console.log(restraint.tag == "gag" && restraint.name == "AC");
    }

    //=============Perks===============//

    perkKeenEye(){
        return this.escapeLvl() >= 5;
    }

    perkBlindfoldFamiliarity(){
        return this.escapeLvl() >= 10;
    }

    perkOpportunist(){
        return this.escapeLvl() >= 15;
    }

    perkDiscreetOwner(){
        return this.escapeLvl() >= 20;
    }

    perkNotAgain(){
        return this.escapeLvl() >= 25;
    }

    perkAggressiveAcrobatics(){
        return this.escapeLvl() >= 30;
    }

    perkCarefulFumbler(){
        return this.escapeLvl() >= 35;
    }

    perkSelfDiscipline(){
        return this.escapeLvl() >= 40;
    }

    perkFluentInGag(){
        return this.escapeLvl() >= 45;
    }

    perkTinkerer(){
        return this.escapeLvl() >= 50;
    }

    perkFalseStarter(){
        return this.escapeLvl() >= 55;
    }

    perkPenaltyKicker(){
        return this.escapeLvl() >= 60;
    }

    perkPeoplePerson(){
        return this.escapeLvl() >= 65;
    }

    
}

//var EscapeSystem = new D2EscapeSystem();


