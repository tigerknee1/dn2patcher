/*:
 * @plugindesc This plugin tracks the state of the escape system's menu
 * @author D2
 *
 * @help
 * Make sure this is loaded after D2_EscapeSystem.js
 */

class D2EscapeMenu extends D2EscapeGraphics {
    constructor() {
        super();
    }

    //======================================================//
    //                    BUTTONS                           //
    //======================================================//

    showButtons(){
        //Menu name picture
        if ($gameTemp.EIprevMenuName != $gameTemp.EImenuName){ //If new menu
            //Show title image on top of the others
            $gameScreen.showPicture(90, "Escape/Buttons/" + $gameTemp.EImenuName, 1, $gameTemp.buttonsInitX - 14, $gameTemp.buttonsInitY + ($gameTemp.buttonYMultiplier*$gameTemp.EIselectionID), 100, 100, 255, 0);
            //Show buttons
        for (i = 0; i < $gameTemp.buttons.length; i++) {
            $gameScreen.showPicture(i+$gameTemp.EIfirstButtonImageID, "Escape/Buttons/"+$gameTemp.buttons[i], 1, $gameTemp.buttonsInitX, $gameTemp.buttonsInitY+($gameTemp.buttonYMultiplier*i), 100, 100, 255, 0)
        }
        //Delete leftover buttons
        for (i = $gameTemp.buttons.length; i < $gameTemp.EIprevMenuLength; i++) {
            $gameScreen.erasePicture($gameTemp.EIfirstButtonImageID+i);
        }
        } else {
            $gameScreen.showPicture(90, "Escape/Buttons/" + $gameTemp.EImenuName, 1, $gameTemp.buttonsInitX - 50, $gameTemp.buttonsInitY - $gameTemp.buttonYMultiplier, 100, 100, 255, 0);
        }
        //Tint disabled buttons
        if (this.legsSelectionDisabled()) this.tintButton("Legs");
        if (this.gagSelectionDisabled()) this.tintButton("Gag");
        if (this.blindfoldSelectionDisabled()) this.tintButton("Blindfold");
        if (this.torsoSelectionDisabled()) this.tintButton("Torso");
        if (this.distractionSelectionDisabled()) this.tintButton("Distraction");
        if (this.inspectDisabled()) this.tintButton("Inspect");
        if (!this.canMove()) this.tintButton("Move");
        if (!this.playerHasItem()) this.tintButton("Items");
    }

    moveButtons(){
        for(i = 0; i < $gameTemp.buttons.length; i++) {
            //Move all pictures to their default position except the selection one
            if (i != $gameTemp.EIselectionID){
                $gameScreen.movePicture(i+$gameTemp.EIfirstButtonImageID, 1, $gameTemp.buttonsInitX, $gameTemp.buttonsInitY+($gameTemp.buttonYMultiplier*i), 100, 100, 255, 0, 10);
            }
            //Move the one selected toward the cursor
            $gameScreen.movePicture($gameTemp.EIselectionID + $gameTemp.EIfirstButtonImageID, 1, $gameTemp.buttonsInitX - 14, $gameTemp.buttonsInitY + ($gameTemp.buttonYMultiplier*$gameTemp.EIselectionID), 100, 100, 255, 0, 10);
            //Move the headline to its place
            $gameScreen.movePicture(90, 1, $gameTemp.buttonsInitX - 50, $gameTemp.buttonsInitY - $gameTemp.buttonYMultiplier, 100, 100, 255, 0, 10);

        }
    }

    tintButton(buttonId){
        var index = $gameTemp.buttons.indexOf(buttonId);
        if (index > -1){
            $gameScreen.tintPicture($gameTemp.EIfirstButtonImageID + index, [0,0,0,255], 1);
        }
    }

    updateButtons(){
        $gameTemp.EIprevMenuLength = $gameTemp.buttons.length;
        $gameTemp.EIprevMenuName = $gameTemp.EImenuName;
        switch ($gameTemp.EImenuID){
            case 0: //Main menu
                $gameTemp.EImenuName = "Main";
                $gameTemp.buttons = ["Struggle","Inspect","MakeNoise","Move","GiveUp"];
                this.showButtons();
                break;

            case 1: //Struggle submenu
                $gameTemp.EImenuName = "Struggle";
                if (this.tie.name == "Suspension") {
                    $gameTemp.buttons = ["Suspension","Gag","Blindfold","Relax"];
                }
                if (this.tie.name == "Hogtie") {
                    $gameTemp.buttons = ["Connection","Gag","Blindfold","Relax"];
                }
                if (["Basic","Frog","Chair"].includes(this.tie.name)) {
                    $gameTemp.buttons = ["Wrists","Torso","Legs","Gag","Blindfold","Relax"];
                }
                this.showButtons();
                break;

            case 2: //Inspect submenu
                $gameTemp.EImenuName = "Inspect";
                if (this.tie.name == "Suspension") {
                    $gameTemp.buttons = ["Surroundings","Items","Suspension","Gag","Distraction"];
                }
                if (this.tie.name == "Hogtie") {
                    $gameTemp.buttons = ["Surroundings","Items","Connection","Gag","Distraction"];
                }
                if (["Basic","Frog","Chair"].includes(this.tie.name)) {
                    $gameTemp.buttons = ["Surroundings","Items","Wrists","Torso","Legs","Gag","Distraction"];
                }
                this.showButtons();
                break;

            case 3: //Make noise submenu
                $gameTemp.EImenuName = "MakeNoise";
                $gameTemp.buttons = ["CallGuard","CallAlly"];
                this.showButtons();
                break;
        }

        if ($gameTemp.EIprevMenuName != $gameTemp.EImenuName){ //If new menu
            this.moveButtons();
        };
    }

    //==============================================================//
    //                     SELECTIONS ETC                           //
    //==============================================================//

    menuInitials(){
        $gameTemp.EIblinkAnim = 0;
        $gameTemp.EIeyeFrame = 0;
        $gameTemp.EIgraphicsUpdateType = 0;
        $gameTemp.EIstruggleAnimTimer = 0;
        $gameTemp.EIminigameButtonHeld = false;
        $gameTemp.EIstruggleAnimUpdate = false;
        $gameTemp.EIdistractingStruggle = false;
        $gameTemp.EIstruggleTimerStarted = false;
        $gameTemp.EIminigameTimer = 0;
        $gameTemp.EIminigameTimerMax = 0;
        $gameTemp.EImissTimer = 0;
        $gameTemp.struggleType = ''
        $gameTemp.struggleInProgress = false;
        $gameTemp.bgType = $gameVariables.value(130); //Type of BG (number)
        $gameTemp.EIx = 0; //Body images x offset (for hogtie => suspension)
        $gameTemp.EIy = this.tie.name == "Suspension" ? -145 : 0; //Body images y offset (for hogtie => suspension)
        $gameTemp.buttonsInitX = 980; //The X value of unselected buttons
        $gameTemp.buttonsInitY = 120; //100 //The Y value of the top button
        $gameTemp.buttonYMultiplier = 50; //The Y distance between buttons
        $gameTemp.EIfirstButtonImageID = 80; //What image ID the first button gets
        $gameTemp.buttons = [];
        $gameTemp.EIselectionID = 0;
        $gameTemp.EImenuID = 0;
        $gameTemp.EImenuName = "";
        $gameTemp.newMenu = true;
        $gameTemp.EIcommandFunction = "";
        $gameTemp.EIdialogue = [];
        $gameTemp.EIcursorSound = "CursorNew2";
        $gameTemp.EIselectionSound = "DecisionNew2";
        $gameTemp.EIWrongSound = "Buzzer1";
        $gameTemp.EIcancelSound = "CancelNew";
        $gameTemp.EIcursorID = 95; //image ID of the cursor
        $gameTemp.EIrelevantInputs = ["ok","cancel","left","right","up","down"];
        $gameTemp.buttonCheck = false;
        $gameTemp.EIinitialized = false;
        $gameSwitches.setValue(46, false); //Set "Hopping" game variable to OFF
        if (this.perkBlindfoldFamiliarity()) this.revealLvl(this.blindfold);

        //=====Image preloading and resource calls========//
        this.preloadImages()
        //Show background
        if (this.tie.name == "Chair"){ //Ties with unique background variants
            $gameScreen.showPicture(1, "Escape/Backgrounds/Chair"+this._backgroundID, 0, 0, 0, 100, 100, 255, 0);
        } else {
            $gameScreen.showPicture(1, "Escape/Backgrounds/"+this._backgroundID, 0, 0, 0, 100, 100, 255, 0);
        };
        if (this.hasPole()){
            $gameScreen.showPicture(45, "Escape/Backgrounds/Pillar"+this.tie.name+this._poleId, 0, 0, 0, 100, 100, 255, 0);
        }
        //Play BGM
        AudioManager.playBgm({name: "A Little Tied Up", volume: 90, pitch: 100, pan: 0});
    }

    menuLoadMain(){
        $gameTemp.EImenuID = 0;
        this.cursorReset();
        /*
        if (this.timeLimit()){ //this.timeLimit()
            CallPluginCommand('InformationWindow 10 Text: \\br \\fs[16]Escape lvl: ${EscapeSystem.escapeLvl()} \\br Item: \\v[121] \\br Time left: ${EscapeSystem.timeLeft()}')
        } else {
            CallPluginCommand('InformationWindow 10 Text: \\br \\fs[16]Escape lvl: ${EscapeSystem.escapeLvl()} \\br Item: \\v[121]')
        };
        CallPluginCommand('InformationWindow 10 Position: 0 -20')
        CallPluginCommand('InformationWindow 10 Size: 200 2.5')
        CallPluginCommand('InformationWindow 10 Show')
        */
        CallPluginCommand("writetext 10 10 main1 \\fs[16]Escape lvl: ${EscapeSystem.escapeLvl()} (${EscapeSystem.escapeExp()} / ${EscapeSystem.expThreshold()} exp)");
        //CallPluginCommand("writetext 10 35 main2 \\fs[16]Item: \\v[121]")
        if (this.timeLimit()){
            CallPluginCommand("writetext 10 35 main2 \\fs[16]Time left: ${EscapeSystem.timeLeft()}");
        }
        this.updateItemHud();
        this.updateComboHud();
        this.updateAutoStruggleHud();
        this.clearRestraintHud();
        //$gameScreen.erasePicture(90)
        this.updateButtons();
    }

    mainMenuSelection(action){
        switch (action){
        case "Struggle":
            $gameTemp.EImenuID = 1;
            this.cursorReset();
            this.updateButtons();
            this.updateHUD();
            break;
        case "Inspect":
            if (this.inspectDisabled()){
                AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                break;
            }
            $gameTemp.EImenuID = 2;
            this.cursorReset();
            this.updateButtons();
            this.updateHUD();
            break;
        case "MakeNoise":
            $gameTemp.EImenuID = 3;
            this.cursorReset();
            this.updateButtons();
            break;
        case "Move":
            this.moveSelection();
            break;
        case "GiveUp":
            $gameTemp.EIcommandFunction = "GiveUpConfirmation";
            break;
        }
    }

    struggleMenuSelection(action){
        switch (action){
        case "Connection":
        case "Suspension":
            this.struggle(this.tie.name);
            break;
        case "Wrists":
        case "Gag":
        case "Torso":
        case "Blindfold":
        case "Legs":
            this.struggle(action);
            break;
		case "Relax":
			this.relax();
			break;
        }
    }

    relevantButtonPressed(){
        for (i = 0; i < $gameTemp.EIrelevantInputs.length; i++) {
            if (Input.isPressed($gameTemp.EIrelevantInputs[i])){
                return true;
            }
        }
        return false;
    }

    cursorUpdate(){
        $gameScreen.movePicture($gameTemp.EIcursorID, 1, $gameTemp.EIcursorX, $gameTemp.EIcursorY, 100, 100, 255, 0, 4);
        for (i = 0; i < $gameTemp.buttons.length; i++) {
            $gameScreen.movePicture(i+$gameTemp.EIfirstButtonImageID, 1, $gameTemp.buttonsInitX, $gameTemp.buttonsInitY+($gameTemp.buttonYMultiplier*i), 100, 100, 255, 0, 10);
            //Move the one selected in
            $gameScreen.movePicture($gameTemp.EIselectionID + $gameTemp.EIfirstButtonImageID, 1, $gameTemp.buttonsInitX - 14, $gameTemp.buttonsInitY + ($gameTemp.buttonYMultiplier*$gameTemp.EIselectionID), 100, 100, 255, 0, 10);
        }
        $gameTemp.buttonCheck = true;
    }

    cursorReset(){
        $gameTemp.EIcursorY = $gameTemp.buttonsInitY;
        $gameTemp.EIselectionID = 0;
        this.cursorUpdate();
    }

    moveSelection(){
        if (!this.canMove()){
            AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
            return;
        }
        $gameVariables.setValue(148, "Move"); //MenuResult
        if (this.hasDistraction()) {
            $gameSwitches.setValue(68, true); //Prepare distracting action (not struggle)
        }
        if (this.legs.meter > 0){ //if legs are tied
            $gameSwitches.setValue(46, true); // Hopping = ON
        }
        $gameTemp.EIcommandFunction = "End";
    }

    gagInspect(){
        if (this.gagSelectionDisabled()){
            AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
            return;
        }
        if (this.updateInspected(this.gag)){
            switch (this.gag.name){
                case "Cleave":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(A cleave gag. It makes it difficult for people to \\br hear and understand me...)");
                    break;
                case "Knotted":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(A stuffed and knotted cleave gag. It makes it \\br difficult for people to hear and understand me...)");
                    break;
                case "OTM":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(A stuffed OTM gag. It makes it difficult for people to \\br hear and understand me...)");
                    break;
                case "OTN":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(A stuffed OTN gag. It makes it difficult for people to \\br hear and understand me...)");
                    break;
                case "Ball":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(A ball gag! It's really uncomfortable and seems \\br hard to get out...)");
                    break;
                case "AC":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(An Anti-Chromatic gag. It's making my mouth feel numb, \\br and the straps make it impossible for me to remove it \\br on my own...)");
                 break;
            }
        }
    }

    distractionInspect(){
        if (this.distractionSelectionDisabled()){
            AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
            return;
        }
        switch (this.tie.name){
                case "Hogtie":
                case "Suspension":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(That rope...is very distracting when I move!)");
                    break;
                default:
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(That rope...is very distracting when I try to \\br move my legs!)");
            }
    }

    inspectionMenuSelection(action){
        if (action == "Surroundings"){
            $gameVariables.setValue(148, "InspectSurroundings"); //MenuResult
            if (!EscapeSystem.inspectedSurroundings()){
                this._inspectedSurroundings = true;
                this.reduceTimeLeft(1);
            }
            $gameTemp.EIcommandFunction = "End";
            return;
        }
        if (action == "Items"){
            if (this.playerHasItem()){
                let uniqueItems = [...new Set(this._gainedItems)]
                for (i = 0; i < uniqueItems.length; i++){
                    $gameTemp.EIdialogue.push(`\\nr<${this._captiveName}>${uniqueItems[i].description}`);
                }
            } else {
                AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                //$gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(I don't have any items...)")
            }
        }
        switch(action){
        case "Gag":
            this.gagInspect()
            break;
        case "Distraction":
            this.distractionInspect()
            break;
        case "Connection":
            if (this.updateInspected(this.hogtie)){
                $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(I can't reach any of the other knots while this \\br rope connects my wrists to my ankles.)");
                $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(I need to get it loose before I can try the others.)");
            }
            break;
        case "Suspension":
            if (this.updateInspected(this.suspension)){
                $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(There is no way I can get my wrists or ankles free \\br while these ropes are keeping me suspended like this.)");
                $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(Maybe if I struggle, they will come loose and let\\br me down on the ground. That might hurt, though, \\br let alone make noise.)");
            }
            break;
        case "Wrists":
            if (this.updateInspected(this.wrists)){
                switch(this.tie.name){
                case "Frog":
                    if (this.hasPole()) {
                        $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My wrists are tied pretty tightly behind the pole.)");
                    } else {
                        $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My wrists are tied pretty tightly behind my back.)");
                    }
                    if (this.torso.meter > 0){ //Torso bindings on
                        $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(I can't move them much while my arms are \\br pinned to my torso...)");
                    }
                    break;
                case "Basic":
                case "Chair":
                    if (this.hasPole()) {
                        $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My wrists are tied pretty tightly behind the pole.)");
                    } else {
                        $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My wrists are tied pretty tightly behind my back.)");
                    }
                    if (this.torsoIsBound()){ //Torso bindings on
                        $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(It'll be difficult to get them free while my \\br torso is also tied...)");
                    }
                    break;
                }
            }
            // End of case "Wrists"
            break;
        case "Torso":
            if (this.torsoSelectionDisabled()){
                AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                break;
            }
            if (this.updateInspected(this.torso)){
                switch(this.tie.name){
                case "Frog":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My torso being tied this way makes it extra \\br hard to move my wrists...)");
                    break;
                case "Chair":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My torso is tied tightly to the chair. \\br It makes it hard to move my arms...)");
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(These ropes around my chest makes it much harder \\br to move my arms and wrists...)");
                    break;
                case "Basic":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(These ropes around my chest makes it much harder \\br to move my arms and wrists...)");
                    break;
                }
            }
            // End of case "Torso"
            break;
        case "Legs":
            if (this.legsSelectionDisabled()){
                AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                break;
            }
            if (this.updateInspected(this.legs)){
                switch(this.tie.name) {
                case "Frog":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(The way my legs are tied leaves very little \\br room for struggling, let alone moving around...)");
                    break;
                case "Chair":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My ankles are tied together. Maybe I can hop around, but \\br that will take more time than if I have my legs free...)");
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(First I would need to free my torso from the chair, \\br though...)")
                    break;
                case "Basic":
                    $gameTemp.EIdialogue.push("\\nr<"+this._captiveName+">(My ankles are tied together. Maybe I can hop around, but \\br that will take more time than if I have my legs free...)");
                }
            }
        }

        this.updateHUD()
        if ($gameTemp.EIdialogue.length > 0){
            $gameTemp.EIcommandFunction = "InspectionSelection";
        }
    }

    makeNoiseMenuSelection(action){
        $gameVariables.setValue(148, action)
        $gameTemp.EIcommandFunction = "End";
    }

    updateInspected(restraint){
        if (restraint.meter > 0 ){
            if (this.lvlIsHidden(restraint)){
                this.reduceTimeLeft(1);
            }
            this.revealLvl(restraint);
            return true;
        }
        AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
        return false;
    }

    struggle(type){
        switch (type){
            case "Gag":
                if (this.gagSelectionDisabled()){
                    AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                    return;
                }
                break;
            case "Torso":
                if (this.torsoSelectionDisabled()){
                    AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                    return;
                }
                break;
            case "Legs":
                if (this.legsSelectionDisabled()){
                    AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                    return;
                }
                break;
            case "Blindfold":
                if (this.blindfoldSelectionDisabled()){
                    AudioManager.playSe({name: $gameTemp.EIWrongSound, volume: 35, pitch: 100, pan: 0});
                    return;
                }
                break;
        }
        $gameTemp.struggleType = type;
        $gameTemp.EIcommandFunction = "StruggleMinigame";
    }

	relax() {
		$gameTemp.EIdialogue.push("You take a moment to relax...");
		//EscapeSystem.reduceMeter(EscapeSystem.distraction, 1000);
		EscapeSystem.reduceTimeLeft(3);

        this.updateHUD()
        if ($gameTemp.EIdialogue.length > 0){
            $gameTemp.EIcommandFunction = "InspectionSelection";
        }
	}

    newTie(oldTie, newTie){
        //oldTie is a string, newTie is a number or string
        this.clearRestraintHud()
        $gameScreen.showPicture(100, "Black", 0, 0, 0, 100, 100, 0, 0);
        $gameScreen.movePicture(100, 0, 0, 0, 100, 100, 255, 0, 20)
        this.setTie(newTie)
        //Clears tie image cache. This is also done further down when you successfully escape.
        for (const key in Core.cache.images.pictures) {
            if (key.startsWith("EI") && key.includes(oldTie)) {
                delete Core.cache.images.pictures[key];
            }
        }
        $gameScreen.movePicture(100, 0, 0, 0, 100, 100, 255, 0, 20)
        $gameTemp.EIcommandFunction = oldTie+"Free";
        $gameTemp.EIinitialized = false; //re-initialize
    }

    /*
    showHudWindow(id, posx, posy, text, num, pic){ //num here referes to the meter value of a restraint
        CallPluginCommand('InformationWindow ' + id + ' Text: ' + text)
        CallPluginCommand('InformationWindow ' + id + ' Position: ' + posx + ' ' + posy)
        CallPluginCommand('InformationWindow ' + id + ' Size: 250 1.2')
        CallPluginCommand('InformationWindow ' + id + ' Show')
        if (id == 7){ //if crotch rope window, use red bar instead
            Galv.VBAR.create(id, "bar1b", "bar1_bg", `${num}`, 80, posx + 10, posy + 79, 0, 0);
        }else{
            Galv.VBAR.create(id, "bar1", "bar1_bg", `${num}`, 80, posx + 10, posy + 79, 0, 0);
        }
        $gameScreen.showPicture(id, "EIHUD" + pic, 0, 0, 0, 100, 100, 255, 0)
    }

    hideHudWindow(id){
        CallPluginCommand('InformationWindow '+ id +' Hide')
        Galv.VBAR.remove(id);
        $gameScreen.erasePicture(id);
    }
    */

    showHudWindow(id, posx, posy, thetext, num, pic){ //num here referes to the meter value of a restraint
        if (!!$gameSystem._varBars[id]) {
            //If HUD window already exists
            return;
        }
        CallPluginCommand(`writetext ${posx} ${posy} ${id} ${thetext}`)
        let barName = "bar1";
        if (id == 8){ //if crotch rope window, use red bar instead
            barName = "bar1b";
        }
        $gameScreen.showPicture(id, "Escape/HUD/" + pic, 0, 0, 0, 100, 100, 255, 0)
        Galv.VBAR.create(id, barName, "bar1_bg", num, 80, posx + 10, posy + 52, 0, 0);
    }

    hideHudWindow(id){
        if (!$gameSystem._varBars[id]) {
            //If HUD window doesn't exist
            return;
        }
        CallPluginCommand(`removetext ${id}`);
        Galv.VBAR.remove(id);
        $gameScreen.erasePicture(id);
    }

    clearRestraintHud(){
        for (var i = 3; i <= 9; ++i) {
            CallPluginCommand(`removetext ${i}`);
            Galv.VBAR.remove(i);
            $gameScreen.erasePicture(i);
        };
    }

    //==============================================================//
    //                     MAIN LOOP                                //
    //==============================================================//

    mainLoop(){

         //====================Initials=================//
        if (!$gameTemp.EIinitialized){
            $gameTemp.EIcursorX = $gameTemp.buttonsInitX - 120;
            $gameTemp.EIcursorY = $gameTemp.buttonsInitY;
            $gameScreen.showPicture($gameTemp.EIcursorID, "MenuCursor", 1, $gameTemp.EIcursorX, $gameTemp.EIcursorY, 100, 100, 255, 0);
            this.characterGraphicsUpdate()
            this.menuLoadMain()
            if (D2.story() >= 100 && D2.story() < 200 && $gameVariables.value(163) < 2 && !$gameSwitches.value(143)){ // If story is first chapter-ish and tutorials are on and you haven't seen this tutoriral
                $gameSwitches.setValue(143, true) //Escape tutorial switch
                $gameTemp.EIcommandFunction = "Tutorial";
            }
            $gameTemp.buttonCheck = true;
            $gameTemp.EIinitialized = true;
        };

        //==========LOOP==========//
        //Part of the code is in the common event that calls this script, because the script can't do things like waiting

        //Lower distraction from non-distracting non-menu action
        if (this._oldTimeLeft != this.timeLeft()){ //if old time points not equal to time left
            //time points have changed while not in the menu
            if (this._oldTimeLeft > 0){ //if not the first time you open the menu
                if (!$gameSwitches.value(68)){ // If not distracting action
                    this.setMeter(this.distraction, this.distraction.meter - 400*(this._oldTimeLeft - this.timeLeft()))
                    this.updateHUD()
                }
                $gameSwitches.setValue(68, false) //Reset Distracting action (not struggle)
            }
            this._oldTimeLeft = this.timeLeft();
        }

        //idle blinking animation
        if ($gameTemp.EIblinkAnim >= 4000){
            $gameTemp.EIblinkAnim++;
            if ($gameTemp.EIblinkAnim >= 4002){
                if ($gameTemp.EIblinkAnim >= 4006){
                    $gameTemp.EIblinkAnim = 0;
                }
                $gameTemp.EIgraphicsUpdateType = 'EyesOnly';
                this.characterGraphicsUpdate()
            }

        } else {
            if (Core.randomInt(0, 19) == 0) {
                $gameTemp.EIblinkAnim += 400 //increase blink timer
            };
        }

        //Win check
        if (this.isFree() || this.customWinCondition()){
            $gameVariables.setValue(148, "Free")
            CallPluginCommand('PlayFile Relief dir:gag/Seles');
            $gameTemp.EIcommandFunction = "End";
        }

        //Hogtie free check
        if (this.tie.name == 'Hogtie' && this.hogtie.meter <= 0){ //If hogtie is free
            this.newTie(this.tie.name, "Basic") //Escape TieID is set to Basic (1)
        }
        //Suspension free check
        if (this.tie.name == 'Suspension' && this.suspension.meter <= 0){ //If suspension is free
            this.newTie(this.tie.name, "Hogtie")
        }

        //Noise end check
        if ($gameVariables.value(148) == 'Noise'){
            $gameTemp.EIcommandFunction = "End";
        }

        //Time is up check
        if (this.isGameOver()){ //If time is up and there is a time limit, or the player has given up
            $gameVariables.setValue(148, "GameOver") //MenuResult
            $gameTemp.EIcommandFunction = "End";
        }


        //Button inputs
        if ($gameTemp.buttonCheck && !this.relevantButtonPressed()){
            $gameTemp.buttonCheck = false;
        }

        let clickedButton;

        if ((Input.isPressed("ok") || TouchInput.isTriggered()) && !$gameTemp.buttonCheck) {
            const isTouchInput = TouchInput.isTriggered();

            if (isTouchInput) {
                for (const picture of $gameScreen._pictures) {
                    if (!picture || !picture._name.includes("Buttons/") || picture._name.includes($gameTemp.EImenuName)) {
                        continue;
                    }

                    // 200 & 42 are the harcoded width & height of button pics because that data cannot be accessed with Game_Picture
                    const cw = 200 / 2;
                    const ch = 42 / 2;
                    const buttonIndex = $gameTemp.buttons.findIndex(b => b === picture.name().split("/").pop());

                    if (buttonIndex > -1 &&
                        !(TouchInput._mouseX < picture.x() - cw || TouchInput._mouseX > picture.x() + cw ||
                        TouchInput._mouseY < picture.y() - ch || TouchInput._mouseY > picture.y() + ch)) {
                            $gameTemp.EIselectionID = buttonIndex;
                            $gameTemp.EIcursorY = $gameTemp.buttonsInitY + ($gameTemp.buttonYMultiplier * buttonIndex);
                            clickedButton = true;
                            break;
                    }
                }
            }

            if (!isTouchInput || clickedButton) {
                let action = $gameTemp.buttons[$gameTemp.EIselectionID];
                switch ($gameTemp.EImenuID){
                case 0: //Main menu
                    this.mainMenuSelection(action);
                    break;
                case 1: //Struggle menu
                    this.struggleMenuSelection(action);
                    break;
                case 2: //Inspect menu
                    this.inspectionMenuSelection(action);
                    break;
                case 3: //Make noise
                    this.makeNoiseMenuSelection(action);
                    break;
                }
                AudioManager.playSe({name: $gameTemp.EIselectionSound, volume: 90, pitch: 100, pan: 0});
                this.cursorUpdate();
            }
        }

        if ((Input.isPressed("cancel") || TouchInput.isCancelled()) && !$gameTemp.buttonCheck){
            if ($gameTemp.EImenuID == 0){
                this.moveSelection()
            } else {
                AudioManager.playSe({name: $gameTemp.EIcancelSound, volume: 90, pitch: 100, pan: 0});
                this.menuLoadMain() //Go to main menu
                this.cursorReset()
            }
            this.cursorUpdate()
        }

        if (Input.isPressed("down") && !$gameTemp.buttonCheck){
            AudioManager.playSe({name: $gameTemp.EIcursorSound, volume: 90, pitch: 100, pan: 0});
            if ($gameTemp.EIselectionID == $gameTemp.buttons.length - 1){ //if on the bottom
                $gameTemp.EIcursorY = $gameTemp.buttonsInitY;
                $gameTemp.EIselectionID = 0;
            } else {
                $gameTemp.EIcursorY += $gameTemp.buttonYMultiplier;
                $gameTemp.EIselectionID++;
            }
            this.cursorUpdate()
        }

        if (Input.isPressed("up") && !$gameTemp.buttonCheck){
            AudioManager.playSe({name: $gameTemp.EIcursorSound, volume: 90, pitch: 100, pan: 0});
            if ($gameTemp.EIselectionID == 0){ //if on top
                $gameTemp.EIcursorY = $gameTemp.buttonsInitY + ($gameTemp.buttonYMultiplier * ($gameTemp.buttons.length - 1)); //uses Menu Max
                $gameTemp.EIselectionID = $gameTemp.buttons.length - 1;
            } else {
                $gameTemp.EIcursorY -= $gameTemp.buttonYMultiplier;
                $gameTemp.EIselectionID -= 1;
            }
            this.cursorUpdate()
        }

        if (Input.isPressed("left") && !$gameTemp.buttonCheck){
            AudioManager.playSe({name: $gameTemp.EIcursorSound, volume: 90, pitch: 100, pan: 0});
            $gameTemp.buttonCheck = true;
        }

        if (Input.isPressed("right") && !$gameTemp.buttonCheck){
            AudioManager.playSe({name: $gameTemp.EIcursorSound, volume: 90, pitch: 100, pan: 0});
            $gameTemp.buttonCheck = true;
        }

        if (Input.isPressed("pageup") && Input.isPressed("shift")){
            $gameTemp.EIcommandFunction = "Cheats";
            $gameTemp.buttonCheck = true;
        }

        for (const picture of $gameScreen._pictures) {
            if (!picture || !picture._name.includes("Buttons/") || picture._name.includes($gameTemp.EImenuName)) {
                continue;
            }

            // 200 & 42 are the harcoded width & height of button pics because that data cannot be accessed with Game_Picture
            const cw = 200 / 2;
            const ch = 42 / 2;
            const buttonIndex = $gameTemp.buttons.findIndex(b => b === picture.name().split("/").pop());

            if (buttonIndex > -1 && TouchInput._lastSelectionMethodUsed === "mouse" &&
                $gameTemp.EIselectionID !== buttonIndex &&
                !(TouchInput._mouseX < picture.x() - cw || TouchInput._mouseX > picture.x() + cw ||
                TouchInput._mouseY < picture.y() - ch || TouchInput._mouseY > picture.y() + ch)) {
                    AudioManager.playSe({name: $gameTemp.EIcursorSound, volume: 90, pitch: 100, pan: 0});
                    $gameTemp.EIselectionID = buttonIndex;
                    $gameTemp.EIcursorY = $gameTemp.buttonsInitY + ($gameTemp.buttonYMultiplier * buttonIndex);
                    this.cursorUpdate();
                    break;
            }
        }
    }

    //==============================================================//
    //                     HUD UPDATE                               //
    //==============================================================//

    updateHUD(){
        let wristsText = "\\fs[22]Wrists lvl: ${EscapeSystem.wrists.display}";
        let hogtieText = "\\fs[22]Connection lvl: ${EscapeSystem.hogtie.display}";
        let suspensionText = "\\fs[20]Suspension lvl: ${EscapeSystem.suspension.display}";
        let gagText = "\\fs[22]Gag lvl: ${EscapeSystem.gag.display}";
        let blindfoldText = "\\fs[19]Blindfold lvl: ${EscapeSystem.blindfold.display}";
        let legsText = "\\fs[22]Legs lvl: ${EscapeSystem.legs.display}";
        let torsoText = "\\fs[22]Torso lvl: ${EscapeSystem.torso.display}";
        let distractionText = "\\fs[22]Distraction";

        switch (this.tie.name){
            case "Chair":
                if (this.wrists.meter > 0){
                    this.showHudWindow(3, 672, 240, wristsText, "EscapeSystem.wrists.meter", "ChairWrists");
                }
                if (this.isGagged()){
                    this.showHudWindow(4, 202, 62, gagText, "EscapeSystem.gag.meter", "ChairGag");
                }
                if (this.isBlindfolded()){
                    this.showHudWindow(5, 616, 47, blindfoldText, "EscapeSystem.blindfold.meter", "ChairBlindfold");
                }
                if (this.torso.meter > 0){
                    this.showHudWindow(6, 167, 221, torsoText, "EscapeSystem.torso.meter", "ChairTorso");
                }
                if (this.legs.meter > 0){
                    this.showHudWindow(7, 120, 463, legsText, "EscapeSystem.legs.meter", "ChairLegs");
                }
                if (this.hasDistraction()){
                    this.showHudWindow(8, 682, 416, distractionText, "EscapeSystem.distraction.meter", "ChairCrotch");
                }
                break;
            case "Frog":
                if (this.wrists.meter > 0){
                    if (this.hasPole()){
                        this.showHudWindow(3, 198, 64, wristsText, "EscapeSystem.wrists.meter", "FrogWristsPole")
                    } else {
                        this.showHudWindow(3, 650, 262, wristsText, "EscapeSystem.wrists.meter", "FrogWristsBox")
                    }
                }
                if (this.isGagged()){
                    this.showHudWindow(4, 200, 156, gagText, "EscapeSystem.gag.meter", "FrogGag")
                }
                if (this.isBlindfolded()){
                    this.showHudWindow(5, 650, 72, blindfoldText, "EscapeSystem.blindfold.meter", "FrogBlindfold")
                }
                if (this.torso.meter > 0){
                    this.showHudWindow(6, 172, 237, torsoText, "EscapeSystem.torso.meter", "FrogTorso")
                }
                if (this.legs.meter > 0){
                    this.showHudWindow(7, 124, 370, legsText, "EscapeSystem.legs.meter", "FrogLegs")
                }
                if (this.hasDistraction()){
                    this.showHudWindow(8, 650, 338, distractionText, "EscapeSystem.distraction.meter", "FrogCrotch")
                }
                break;
            case "Basic":
                if (this.wrists.meter > 0){
                    this.showHudWindow(3, 692, 260, wristsText, "EscapeSystem.wrists.meter", "BasicWrists")
                }
                if (this.isGagged()){
                    this.showHudWindow(4, 174, 237, gagText, "EscapeSystem.gag.meter", "BasicGag")
                }
                if (this.isBlindfolded()){
                    this.showHudWindow(5, 170, 108, blindfoldText, "EscapeSystem.blindfold.meter", "BasicBlindfold")
                }
                if (this.torso.meter > 0){
                    this.showHudWindow(6, 657, 129, torsoText, "EscapeSystem.torso.meter", "BasicTorso")
                }
                if (this.legs.meter > 0){
                    this.showHudWindow(7, 60, 370, legsText, "EscapeSystem.legs.meter", "BasicLegs")
                }
                if (this.hasDistraction()){
                    this.showHudWindow(8, 690, 376, distractionText, "EscapeSystem.distraction.meter", "BasicCrotch")
                }
                break;
            case "Hogtie":
                if (this.hogtie.meter > 0){
                    this.showHudWindow(3, 316, 100, hogtieText, "EscapeSystem.hogtie.meter", "HogtieConnector")
                }
                if (this.isGagged()){
                    this.showHudWindow(4, 68, 394, gagText, "EscapeSystem.gag.meter", "HogtieGag")
                }
                if (this.isBlindfolded()){
                    this.showHudWindow(5, 36, 244, blindfoldText, "EscapeSystem.blindfold.meter", "HogtieBlindfold")
                }
                if (this.hasDistraction()){
                    this.showHudWindow(8, 168, 470, distractionText, "EscapeSystem.distraction.meter", "HogtieCrotch")
                }
                break;
            case "Suspension":
                if (this.suspension.meter > 0){
                    this.showHudWindow(3, 18, 158, suspensionText, "EscapeSystem.suspension.meter", "SuspensionSuspension")
                }
                if (this.isGagged()){
                    this.showHudWindow(4, 120, 380, gagText, "EscapeSystem.gag.meter", "SuspensionGag")
                }
                if (this.isBlindfolded()){
                    this.showHudWindow(5, 50, 276, blindfoldText, "EscapeSystem.blindfold.meter", "SuspensionBlindfold")
                }
                if (this.hasDistraction()){
                    this.showHudWindow(8, 630, 411, distractionText, "EscapeSystem.distraction.meter", "SuspensionCrotch")
                }
                break;
        }
        //Hide windows of undone restraints
        if (!this.isGagged()){this.hideHudWindow(4)}
        if (!this.isBlindfolded()){this.hideHudWindow(5)}
        if (this.torso.meter <= 0){this.hideHudWindow(6)}
        if (this.legs.meter <= 0){this.hideHudWindow(7)}
        if (!this.hasDistraction()){this.hideHudWindow(8)}
    }

    updateItemHud(){
        CallPluginCommand("writetext 10 60 items \\fs[16]Items:")
        if (!this.playerHasItem()){
            CallPluginCommand("writetext 20 85 item0 \\fs[16]None")
            return;
        }
        for (i = 0; i < this._gainedItems.length; i++){
            CallPluginCommand(`writetext 20 ${85+(25*i)} ${"item"+i} \\fs[16]${1+i}) ${this._gainedItems[i].name}`)
        }
        for (i = this._gainedItems.length; i <= 5; i++){
            CallPluginCommand(`removetext item${i}`) //remove spare items from the list
        }
    }

	updateComboHud(){
        CallPluginCommand("writetext 10 200 combo \\fs[16]Combo: ${EscapeSystem.comboCount()}")
	}

	updateAutoStruggleHud(){
        CallPluginCommand(`writetext 10 220 autoStruggle \\fs[16]Auto Struggle: ${EscapeSystem.autoStruggle ? 'On' : 'Off'}`)
	}
}

//var EscapeSystem = new D2EscapeMenu();
