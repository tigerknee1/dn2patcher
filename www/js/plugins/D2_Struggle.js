/*:
 * @plugindesc This plugin handles the struggle minigame
 * @author Pwa
 *
 * @help Baguette
 */

class StruggleMinigame {
    static _setData(interpreter) {
        this.currentData = {
            interpreter,
            distractingStruggle: ["Torso","Legs","Hogtie","Suspension"].includes($gameTemp.struggleType) && EscapeSystem.hasDistraction(), //define which struggles affect the distraction
            directions: ["Up", "Down", "Left", "Right"],
            time: this._maxTime(),
            hits: 0,
            misses: 0,
            critical: false,
            targetDirection: undefined,
            buttonDisplayTime: undefined,
			autoStruggleTimer: 0,
        }
    }

    static _resetData() {
        this.currentData = {};
    }

    static _maxTime() {
        return 6 * 60 + (EscapeSystem.perkFalseStarter() ? 60 : 0);
    }

    static isDistracting() {
        return this.currentData.distractingStruggle;
    }

    static currentDirections() {
        return this.currentData.directions;
    }

    static currentTime() {
        return this.currentData.time;
    }

    static currentHits() {
        return this.currentData.hits;
    }

    static currentMisses() {
        return this.currentData.misses;
    }

    static isCurrentCritical() {
        return this.currentData.critical;
    }

    static currentTargetDirection() {
        return this.currentData.targetDirection;
    }

    static currentButtonDisplayTime() {
        return this.currentData.buttonDisplayTime;
    }

    static _setDirections(directions) {
        return this.currentData.directions = directions;
    }

    static _toggleDistraction(value) {
        this.currentData.distractingStruggle = value;
    }

    static _setTime(value) {
        this.currentData.time = value;
    }

    static _incrementTime(by = 1) {
        this._setTime(this.currentTime() + by);
    }

    static _decrementTime(by = 1) {
        this._incrementTime(-by);
    }

    static _setTargetDirection(direction) {
        this.currentData.targetDirection = direction;
    }

    static _setCritical(value) {
        this.currentData.critical = value;
    }

    static _setHits(value) {
        this.currentData.hits = value;
    }

    static _incrementHits(by = 1) {
        this._setHits(this.currentHits() + by);
    }

    static _decrementHits(by = 1) {
        this._incrementHits(-by);
    }

    static _setMisses(value) {
        this.currentData.misses = value;
    }

    static _incrementMisses(by = 1) {
        this._setMisses(this.currentMisses() + by);
    }

    static _decrementMisses(by = 1) {
        this._incrementMisses(-by);
    }

    static _setButtonDisplayTime(value) {
        this.currentData.buttonDisplayTime = value;
    }

    static _playSE(name, volume = 80, pitch = 100, pan = 0) {
        AudioManager.playSe({ name, volume, pitch, pan });
    }

    static _playWinSE() {
        this._playSE("Decision1");
    }

    static _playDoneSE() {
        this._playSE("Bell3");
    }

    static _playHitSE() {
        this._playSE("Decision3", 45);
    }

    static _playMissSE() {
        this._playSE("Buzzer1", 10);
    }

    static _playOpportunistPerkSE() {
        this._playSE("Wind4", 45);
    }

    static _playGrunt() {
        if (EscapeSystem.isGagged()) {
            CallPluginCommand('PlayFile Angry dir:gag/Seles');
        } else {
            CallPluginCommand(`PlayFile ${Core.randomInArray(["Gh","Grr","Nngh"])} dir:voice/Seles`);
        }
    }

    static _playRelief() {
        if ($gameTemp.struggleType == "Gag" && !EscapeSystem.isGagged()) {
            CallPluginCommand('PlayFile Relief dir:gag/Seles');
        }
    }

    static _isTimerVisible() {
        return $gameVariables.value(124) !== 1;
    }

    static _drawTimer() {
        Galv.VBAR.create(10, "barHourglass", "barHourglass_bg", "StruggleMinigame._displayTime()", "StruggleMinigame.currentTime()", 30, 650, 0, 0, Direction.UP);
    }

    static _relevantInputs() {
        return ["ok","cancel","left","right","up","down"];
    }

    static _displayTime() {
        return $gameTimer.isWorking() ? $gameTimer._frames : this.currentTime() * 2;
    }

    static _areArrowsCentered() {
        return $gameVariables.value(126) > 1;
    }

    static _arrowX(direction = this.currentTargetDirection()) {
        if (this._areArrowsCentered()) {
            return 540;
        }

        if (direction === "Left") {
            return 200;
        } else if (direction === "Right") {
            return 800;
        }

        return 540;
    }

    static _arrowY(direction = this.currentTargetDirection()) {
        if (this._areArrowsCentered()) {
            return 400;
        }
        
        if (direction === "Up") {
            return 50;
        } else if (direction === "Down") {
            return 560;
        }

        switch(EscapeSystem.tie.name) {
            case "Chair":
                return 400;
            case "Basic":
            case "Frog":
                return 500;
            case "Hogtie":
                return 360;
            case "Suspension":
                return 540;
        }

        return 400;
    }

    static _arrowPictureName() {
        return "KeyboardArrow";
    }

    static _arrowWidth() {
        return 65;
    }

    static _arrowHeight() {
        return 67;
    }

    static _showArrow(direction, x, y) {
        $gameScreen.showPicture(91, `${this._arrowPictureName()}${direction}`, 1, x, y, 100, 100, 255, 0);
    }

    static _fadeOutArrow(direction = this.currentTargetDirection(), x = this._arrowX(), y = this._arrowY()) {
        $gameScreen.showPicture(92, `${this._arrowPictureName()}${direction}`, 1, x, y, 100, 100, 255, 0);
        $gameScreen.movePicture(92, 1, x, y, 150, 150, 0, 0, 20);
    }

    static _targetsSetup() {
        this._setTargetDirection(Core.randomInArray(this.currentDirections()));
        this._showArrow(this.currentTargetDirection(), this._arrowX(), this._arrowY());
        this._setButtonDisplayTime(this._displayTime());
    }

    static _startTimer() {
        const attemptsToStart = EscapeSystem.perkFalseStarter() ? 2 : 1; //False starter perk

        if (!$gameTimer.isWorking() && this.currentHits() + this.currentMisses() === attemptsToStart) {
            $gameTimer.start(this.currentTime()) //Start timer if it hasn't started yet and you've made enough attempts
        }
    }

    static _calc() {
        //======Initials==========//
        const restraintPenalties = []; //Penalties and bonuses are added to this list. The final value with be multipled by each of them in turn.
        let activeRestraint = 0;
        let struggle = 600 + (3 * EscapeSystem.escapeLvl()); //the struggle value, which will be subtracted from the current restraint. Start with Seles' escape level * 3 + 600

        //Restraint variations
        switch ($gameTemp.struggleType){
            case 'Torso':
                activeRestraint = EscapeSystem.torso;
                break;
            case 'Legs':
                activeRestraint = EscapeSystem.legs;
                if (EscapeSystem.tie.name == "Frog"){ 
                    restraintPenalties.push(0.75) //leg struggle is 25% harder while frog tied
                };
                break;
            case 'Hogtie':
                activeRestraint = EscapeSystem.hogtie;
                break;
            case 'Suspension':
                activeRestraint = EscapeSystem.suspension;
                break;
            case 'Wrists':
                activeRestraint = EscapeSystem.wrists;
                if (EscapeSystem.torso.meter > 0){ 
                    restraintPenalties.push(1/3) //if torso is tied, divide wrist struggle by 3
                };
                break;
            case 'Gag':
                activeRestraint = EscapeSystem.gag;
                restraintPenalties.push(1.25) //25% bonus
                if (EscapeSystem.gag.name == "AC"){ 
                    struggle = 0; //If AC gag, make struggle futile
                };
                break;
            case 'Blindfold':
                activeRestraint = EscapeSystem.blindfold;
                restraintPenalties.push(1.25) //25% bonus
                break;
        };
        
        //========ITEM BONUS===============//
        if (!['Gag','Blindfold'].includes($gameTemp.struggleType)){
            const tinkerer = EscapeSystem.perkTinkerer() ? 2 : 1;
            struggle += Math.max(...EscapeSystem.getItemStruggleBonuses()) * tinkerer; //Only use the highest bonus
        }

		// Combo bonus
		restraintPenalties.push(Math.min(0.9 + EscapeSystem.comboCount() * 0.02, 2));

        //=======Additional penalties==========//
        restraintPenalties.push(1 / activeRestraint.lvl); //Restraint level
        restraintPenalties.push((EscapeSystem.escapeLvl() + 400) / 400); //0~25% bonus from escape level

        //Crit hit
        if (this.isCurrentCritical()){
            restraintPenalties.push(1.1); //10% bonus from a crit
            this._setCritical(false);
        }
        //Crotch rope
        if (this.isDistracting()){
            const selfDiciplineFactor = EscapeSystem.perkSelfDiscipline() ? 0.4 : 0.8;
            restraintPenalties.push((10000 - (EscapeSystem.distraction.meter * selfDiciplineFactor)) / 10000); //Distraction is inverted and added as penalty
            EscapeSystem.increaseMeter(EscapeSystem.distraction, 50);
        }
        //Anti-Chromatic bindings
        if (EscapeSystem.hasACPenalty()) {
            restraintPenalties.push(1 - ((10 * EscapeSystem.ACCount()) / (100 + EscapeSystem.escapeLvl()))) ; //AC ropes cut struggle by 5~50% depending on escape level and number of AC restraints
        }
        //========APPLY PENALTIES===============//
        for (let i = 0; i < restraintPenalties.length; i++) {
            struggle *= restraintPenalties[i]; //apply all the bonuses and penalties
        }
        //========Apply value to meter =============//
        EscapeSystem.reduceMeter(activeRestraint, struggle);
    }

    static _hit() {
        this._incrementHits();
        this._fadeOutArrow();

		EscapeSystem.incrementComboCount();
		EscapeSystem.updateComboHud();

        if (EscapeSystem.perkOpportunist() && this.currentData.buttonDisplayTime - $gameTimer._frames < 25) {
            this._setCritical(true); //"Opportunist" perk effect triggered 
            $gameScreen.tintPicture(92, [0,255,0,255], 1);
            this._playOpportunistPerkSE();
        }

        this._calc();
        this._playHitSE();
        $gameTemp.EIstruggleAnimUpdate = true;
        this._targetsSetup();
    }

    static _miss() {
        this._incrementMisses();
        AudioManager.stopSe();
        this._playGrunt();

        if (this.isDistracting()) {
            EscapeSystem.increaseMeter(EscapeSystem.distraction, 300);
        }

		EscapeSystem.resetComboCount();
		EscapeSystem.updateComboHud();

        $gameTemp.EIblinkAnim = 4004;
        $gameTemp.EIstruggleAnimTimer = 0;
        $gameTemp.EImissTimer = 60;
        $gameTemp.EIstruggleAnimUpdate = false;
        this._playMissSE();
    }

    static _clearInputRecords() {
        for (const input of this._relevantInputs()) {
            delete Input._currentState[input];
        }

        TouchInput._triggered = false;
    }

    static _checkCorrect(key) {
        if (key === this.currentTargetDirection()) {
            this._hit();
        } else {
            this._miss();
        }

        this._startTimer();
        this._clearInputRecords();
    }

    static _checkWin() {
        switch ($gameTemp.struggleType){ //Checks each win condition
            case "Torso":
                return EscapeSystem.torso.meter <= 0;
            case "Legs":
                return EscapeSystem.legs.meter <= 0;
            case "Wrists":
                return EscapeSystem.wrists.meter <= 0;
            case "Gag":
                return !EscapeSystem.isGagged();
            case "Blindfold":
                return !EscapeSystem.isBlindfolded();
            case "Hogtie":
                return EscapeSystem.hogtie.meter <= 0;
            case "Suspension":
                return EscapeSystem.suspension.meter <= 0;
            default:
                return false;
        }
    }

    static _canCancelWithoutPenalties() {
        return this.currentHits() + this.currentMisses() < 1;
    }

    static _checkMouseClick() {
        if (TouchInput.isTriggered() && !this._areArrowsCentered()) {
            let correctClick;

            for (const picture of $gameScreen._pictures) {
                if (!picture || !picture._name.includes(this._arrowPictureName())) {
                    continue;
                }
            
                // 65 & 67 are the harcoded width & height of arrow pics because that data cannot be accessed with Game_Picture
                const cw = this._arrowWidth() / 2;
                const ch = this._arrowHeight() / 2;
            
                if (!(TouchInput._mouseX < picture.x() - cw || TouchInput._mouseX > picture.x() + cw ||
                    TouchInput._mouseY < picture.y() - ch || TouchInput._mouseY > picture.y() + ch)) {
                        correctClick = true;
                        break;
                }
            }
        
            if (correctClick) {
                this._hit();
            } else {
                this._miss();
            }
        
            this._startTimer();
            this._clearInputRecords();
        }
    }

    static _checkArrowKeystrokes() {
        if (Input.isPressed("left")){
            this._checkCorrect("Left")
        }

        if (Input.isPressed("right")){
            this._checkCorrect("Right")
        }

        if (Input.isPressed("up")){
            this._checkCorrect("Up")
        }

        if (Input.isPressed("down")){
            this._checkCorrect("Down")
        }

		if (Input.isRepeated("A")){
			EscapeSystem.toggleAutoStruggle()
			EscapeSystem.updateAutoStruggleHud();
		}
    }

	static _checkAutoStruggle(){
		if (EscapeSystem.autoStruggle) {
			this.currentData.autoStruggleTimer++;
			if (this.currentData.autoStruggleTimer > 40) {
				this.currentData.autoStruggleTimer = 0;

				this._hit();

				this._startTimer();
				this._clearInputRecords();
			}
		}
	}

    static _checkCancel() {
        if (Input.isPressed("cancel") || TouchInput.isCancelled()) {
            if (this._canCancelWithoutPenalties()) {
                this.end();
            } else {
                this.timeUp();
            }
        }
    }

    static _updateAnimationValues() {
        if ($gameTemp.EIstruggleAnimTimer == 0) {
            if ($gameTemp.EIstruggleAnimUpdate){
                $gameTemp.EIstruggleAnimUpdate = false;
                $gameTemp.EIstruggleAnimTimer++; //This is in both places because it needs to
            }
        } else {
            $gameTemp.EIstruggleAnimTimer++;
        }
        
        if ($gameTemp.EImissTimer > 0) {
            $gameTemp.EImissTimer -= 1;
        } else {
            if($gameTemp.EIblinkAnim >= 4000) {
                $gameTemp.EIblinkAnim++;

                if ($gameTemp.EIblinkAnim >= 4006) {
                    $gameTemp.EIblinkAnim = 0;
                }
            } else {
                if (!Core.randomInt(0, 19)) {
                    $gameTemp.EIblinkAnim += 400;
                }
            }
        }
    }

    static _processFrame() {
        this._checkMouseClick();
        this._checkArrowKeystrokes();
        this._checkAutoStruggle();

        this._checkCancel();

        if (this._checkWin()) {
            this.win();
        } else if ($gameTimer.isWorking() && $gameTimer._frames <= 0) {
            this.timeUp();
        }

        this._updateAnimationValues();
        EscapeSystem.characterGraphicsUpdate();
    }

    static _clearPictures() {
        $gameScreen.erasePicture(91);
        $gameScreen.erasePicture(92);
    }

    static _clearTimer() {
        if (this._isTimerVisible()){
            Galv.VBAR.remove(10);
        }
    }

    static _checkNoiseProduced() {
        if (this.currentMisses() > 0 && EscapeSystem.soundproofness() < 100 && (EscapeSystem.soundproofness() / 10) + Core.randomInt(-1, 1) < this.currentMisses()){
            $gameVariables.setValue(148, "Noise") //Tells the game you were too noisy
        }
    }

    static _updateEscapeSystem() {
        EscapeSystem.updateHUD();
        EscapeSystem.updateButtons();
    }

    static _resetAnimationValues() {
        $gameTemp.EIblinkAnim = 4004;
        $gameTemp.EIstruggleAnimTimer = 0;
        $gameTemp.EImissTimer = 0;
        $gameTemp.EIstruggleAnimUpdate = false;
    }

    static end() {
        if (this.currentData.interpreter) {
            delete this.currentData.interpreter._shouldStall;
        }
        this.initialized = false;
        $gameTemp.buttonCheck = true;
        $gameTemp.struggleInProgress = false;
        $gameTimer.stop();
        this._resetAnimationValues();
        $gameSwitches.setValue(68, this.isDistracting()); //distracting action
        this._clearPictures();
        this._clearTimer();
        this._updateEscapeSystem();
        this._checkNoiseProduced();
        this._resetData();
    }

    static timeUp() {
        this._playDoneSE();
        EscapeSystem.reduceTimeLeft(3);
        this.end();
    }

    static win() {
        this._playWinSE();
        this.end();
    }

    static start(interpreter) {
        this._setData(interpreter);

        if (interpreter) {
            interpreter._shouldStall = true;
        }

        this._targetsSetup();

        if (this._isTimerVisible()) {
            this._drawTimer();
        }

        $gameTemp.struggleInProgress = true;
        this.initialized = true;
        TouchInput._triggered = false; // For mouse input, if the player clicked to start the struggle minigame, that click would still be registered after the minigame start, thus causing a false-positive
    }
}

(() => {
    StruggleMinigame._resetData();

    const D2_Struggle_SceneBase_Update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function(...args) {
        D2_Struggle_SceneBase_Update.call(this, ...args);

        if (StruggleMinigame.initialized) {
            StruggleMinigame._processFrame();
        }
    }
})();
