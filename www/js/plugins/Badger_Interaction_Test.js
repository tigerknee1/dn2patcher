if(typeof Core === "undefined") //for cli testing
{
    Interaction = require('./Badger_Interaction.js').Interaction;
    BS = require('./Badger_Interaction.js').BS;
}

//function Badger_Interaction_Test()
var Badger_Interactions = {};
Badger_Interactions['test'] = function($intr)
{
    /*$intr = new Interaction();
    if($intr.creation == 'loaded')  //use this if you want to go back to an interaction exited by response condition
    {
        $intr.exit = false;
        $intr.start();
        return $intr;
    }*/

    if(typeof Core === "undefined") //for cli testing
    {
        $intr.player_name = 'Seles';
        $intr.default_player_name = 'Seles';
    }
    else
    {
        $intr.player_name = $gameActors.actor(1).name();
        $intr.default_player_name = $gameActors.actor(1).name();
    }

    $intr.player_name = 'Seles';
    $intr.npc_name = 'Other Seles';
    $intr.image_dir = 'InterrogationSelesTest/';
    //$intr.allow_manual_exit = false;

    $intr.variant_groups["hair"] = 2;

    $intr.create_image(30, 'EISelesChairGagBall1', 'ballgag');
    $intr.create_image(30, 'EISelesChairGagBallA1', 'ballgaga1');
    $intr.create_image(30, 'EISelesChairGagBallA2', 'ballgaga2');
    $intr.create_image(30, 'EISelesChairGagBallA3', 'ballgaga3');
    $intr.create_image(31, 'EISelesChairBlindfold1', 'blindfold');
    $intr.create_image(31, 'EISelesChairBlindfold1A1', 'blindfolda1');
    $intr.create_image(31, 'EISelesChairBlindfold1A2', 'blindfolda2');
    $intr.create_image(31, 'EISelesChairBlindfold1A3', 'blindfolda3');

    $intr.create_image(1, 'EIBackgroundChair', '', {start: 1});
    $intr.create_image(2, 'EISelesChairBodyHead', 'bh', {start: 1, variant_group: "hair"});
    $intr.create_image(3, 'EISelesChairRopesTorso', '', {start: 1});
    $intr.create_image(4, 'EISelesChairEyes1Open', 'bl1', {start: 1});
    $intr.create_image(5, 'EISelesChairBodyLegs', '', {start: 1});
    $intr.create_image(6, 'EISelesChairRopesLegs', '', {start: 1});

    $intr.create_image(2, 'EISelesChairBodyHeadA1', 'bha1', {variant_group: "hair"});
    $intr.create_image(2, 'EISelesChairBodyHeadA2', 'bha2', {variant_group: "hair"});
    $intr.create_image(2, 'EISelesChairBodyHeadA3', 'bha3', {variant_group: "hair"});

    $intr.create_image(4, 'EISelesChairEyes1HalfOpen', 'bl2');
    $intr.create_image(4, 'EISelesChairEyes1Closed', 'bl3');

    $intr.create_attribute('anger', {group: 'main'});
    $intr.create_attribute('fear',{group: 'main', value: 66});
    $intr.create_attribute('happiness',{group: 'main'});
    $intr.create_attribute('embarrassment');
    $intr.create_attribute('a random thing here');

    $intr.create_state('gagged');
    $intr.create_state('blindfolded');

    //$intr.create_item('ballgag', 'This is a ball gag.', {rule_add_args: {gagged: 0}, effect_add_args: {gagged: 1}, rule_remove_args: {worn_items:['ballgag']}, effect_remove_args: {gagged: 0}});
    //$intr.create_item('blindfold', {message_on: "Lights out.", message_off: "I'll let you see... for now.\nEnjoy while you can.", blindfolded: 1});
    $intr.create_item('blindfold', {states: {blindfolded: 1}});
    $intr.create_item('ballgag', {states: {gagged: 1}});

    $intr.create_converter('c1', function(message){
        message['text'] = $intr.gag_talk(message['text']);

        if(message['sound'])
            return true;

        const max_attr = $intr.get_max_attr('main');
        const name = "Seles";

        if(max_attr === "neutral")
        {
            var audio_type = "Generic";
        }
        else if(max_attr.name == "anger")
        {
            var audio_type = "Angry";
        }
        else if(max_attr.name == "fear")
        {
            var audio_type = "Scared";
        }
        else if(max_attr.name == "embarrassment")
        {
            var audio_type = "Surprised";
        }

        message['sound'] = "PlayFile " + audio_type + " dir:gag/" + name;
        return true;
    }, {gagged: 1, speaker: 2});
    $intr.create_converter('c2', function(message){message['text'] = message['text'].toLowerCase()}, {speaker: 'Suki'});

    //$intr.create_event_alter('a1', false, [['_characterName', 'SelesDID2']], {gagged: 1}, {event_id: 9});
    $intr.create_event_alter('a1', [['_characterIndex', 1]], {blindfolded: 0, gagged: 0});
    $intr.create_event_alter('a2', [['_characterIndex', 0]], {blindfolded: 0, gagged: 1});
    $intr.create_event_alter('a3', [['_characterIndex', 2]], {blindfolded: 1, gagged: 1});
    $intr.create_event_alter('a4', [['_characterIndex', 3]], {blindfolded: 1, gagged: 0});

    //$intr.create_response('win_happy_true', 'Dig under left tree.', {answer_name:'a1', player_reply:-1}, {followup: 'Told you.'});
    //$intr.create_response('win_happy_false1', 'Dig under middle tree.', {answer_name:'a2', player_reply:-1}, {followup: "Nice old shoe you've got there. Does it fit?"});
    //$intr.create_response('win_happy_false2', 'Dig under right tree.', {answer_name:'a3', player_reply:-1, attempt: 1}, {followup: "Eww, why did you take this?"});
    //$intr.create_response('win_happy_false2b', 'Seriously, dig under right tree.', {answer_name:'a3', player_reply:-1, attempt: 2}, {followup: "Eww, why did you take this?"});
    //$intr.create_response('win_no_answer', 'Not telling you anything more!', {answer_name:-1});
    //$intr.create_response('win_believe', 'I believe you.', {player_reply:1}, {pc_name:true});
    //$intr.create_response('win_not_believe', 'I don\'t believe you.', {player_reply:0}, {pc_name:true});

    $intr.create_response('slap_h1', "Having fun? I sure do!", {action_name: 'slap', happiness: [80,100], comparison: ['happiness', '>', 'anger']});
    $intr.create_response('slap_h2', "Mmmm... kinky!", {action_name: 'slap', happiness: [50,79], comparison: ['happiness', '>', 'anger']});
    $intr.create_response('slap0', "Ok, you win!", {action_name: 'slap', anger: [100,100]}, {exit: true});
    $intr.create_response('slap1', "Just you wait until I get out!", {action_name: 'slap', anger: [61,99]}, {animation: 'test'});
    $intr.create_response('slap2', "Ow! That hurts, you know!", {action_name: 'slap', anger: [31,60]});
    $intr.create_response('slap3', "That's the best you can do?", {action_name: 'slap', anger: [0,30]});

    $intr.create_response('seduce1_1', "Shut up and kiss me already!", {action_name: 'seduce1', happiness: [80,100]});
    $intr.create_response('seduce1_2', "I would, but I'm a little tied up at the moment...", {action_name: 'seduce1', happiness: [60,79]});
    $intr.create_response('seduce1_3', "You're aware I'm basically you, right?", {action_name: 'seduce1', happiness: [40,59]});
    $intr.create_response('seduce1_4', 'Leave me alone, weirdo.', {action_name: 'seduce1', happiness: [20,39]});
    $intr.create_response('seduce1_5', 'No. Go away.', {action_name: 'seduce1', happiness: [0,19]});
    $intr.create_response('seduce2_1', 'Well I like it.', {action_name: 'seduce2'});

    $intr.create_response('threaten1_1', "I'll get better.", {action_name: 'threaten1'});
    $intr.create_response('threaten1_1a', [['Narrator', "But she didn't get better, she is now a newt."]], {last_response: 'threaten1_1', chance: 30}, {extra: function(){$intr.set_internal_var('newt', 1)}});

    $intr.temp_player_name = 'Carol';
    $intr.create_response('threaten2_1c', [[2,"Anything but that!"],[1,"Anything?"]], {action_name: 'threaten2'});
    $intr.temp_player_name = false;
    $intr.create_response('threaten2_1', "Anything but that!", {action_name: 'threaten2'});

    $intr.create_response('tickle1', 'No', {action_name: 'tickle', attempt: 1}, {sound: "PlayFile No dir:voice/Eileen"});
    $intr.create_response('tickle1', 'Noo', {action_name: 'tickle', attempt: 2}, {sound: "PlayFile No dir:voice/Eileen"});
    $intr.create_response('tickle1', 'Nooo', {action_name: 'tickle', attempt: 3}, {sound: "PlayFile No dir:voice/Eileen"});
    $intr.create_response('tickle1', 'Noooo', {action_name: 'tickle', attempt: 4}, {sound: "PlayFile No dir:voice/Eileen"});
    $intr.create_response('tickle1', 'Nooooo', {action_name: 'tickle'}, {sound: "PlayFile No dir:voice/Eileen"});

    $intr.create_response('ballgag_a', 'Gag added.', {action_name: 'Add ballgag'});
    $intr.create_response('ballgag_r', 'Gag removed.', {action_name: 'Remove ballgag'});

    $intr.create_response('blindfold_add_h1a', 'Oooh, this is gonna be fun!', {action_name: 'Add blindfold', happiness: [50,100], max: 'happiness'});
    $intr.create_response('blindfold_add_h1bg', [[1, "I don't understand what you're saying."]], {last_response: 'blindfold_add_h1a', gagged: 1});
    $intr.create_response('blindfold_add_h1b', [[1, 'It\'s not supposed to be fun!']], {last_response: 'blindfold_add_h1a'});
    $intr.create_response('blindfold_add_h1c', 'But it is!', {last_response: 'blindfold_add_h1b'});
    $intr.create_response('blindfold_remove_1', 'Aww, I enjoyed that.', {action_name: 'Remove blindfold', happiness: [50,100], max: 'happiness'});
    $intr.create_response('blindfold_add_1', 'What are you going to do to me now?', {action_name: 'Add blindfold', fear: [50,100], max: 'fear'});
    $intr.create_response('blindfold_remove_1', "Please don't do that again, it's scary.", {action_name: 'Remove blindfold', fear: [50,100], max: 'fear'});
    $intr.create_response('blindfold_add_1', 'Take this off right now or else!', {action_name: 'Add blindfold', anger: [50,100], max: 'anger'});
    $intr.create_response('blindfold_remove_1', "Good.", {action_name: 'Remove blindfold', anger: [50,100], max: 'anger'});
    $intr.create_response('blindfold_add_1', 'Who turned off the light?', {action_name: 'Add blindfold'});
    $intr.create_response('blindfold_remove_1', 'Ah, I can see the light again.', {action_name: 'Remove blindfold'});

    //$intr.create_response('slap', 'SLAP!');
    $intr.create_response('exit', [[1, "I'll just leave you like that, ok?"],[2, "No, come back here!"]], {action_name: 'exit', blindfolded: 1});
    $intr.create_response('exit', 'Bye', {action_name: 'Exit'});


    $intr.create_response('start1', 'Pong.', {action_name: 'start'}, {sound: "PlayFile YoullBeSorry dir:voice/MinaMine", animation: "test"});
    $intr.create_response('default', 'Nothing matched so defaulting to this one.', false);


    //$intr.create_win_condition('win_happy', ['a2','a3','a1'], 'random', {happiness: [100,100]});
    //$intr.create_win_condition('win_angry', ['a2','a3'], 'ordered', {anger: [100,100]});

    //$intr.create_action('top', 'slap', 'SLAP!', {rule_args: {happiness: [50,100], comparison: ['happiness', 'anger','>']},effect_args: {anger: -5, happiness: 10}});
    $intr.create_action('top', 'tickle', 'tickle time!', {effect_args: {anger: 20, happiness: -10}, sound: "PlayFile Ehehe dir:voice/Eileen"});
    $intr.create_action('top', 'slap', 'SLAP!', {effect_args: {anger: 5, happiness: -10, boundary_anger: [0,100], extra: function(){$intr.trustworthiness = 33;}}, sound: "Frog", animation: "test"});
    $intr.create_action('top', 'rslap', 'SLAP!', {rule_args: {extra:function(){return true;}}, effect_args: {anger: -20, happiness: -10, boundary_anger: [40,70]}, sound: "Frog"});
    $intr.create_action('top', 'seduce', '', {has_slaves: true});
    $intr.create_action('top', 'threaten', '', {has_slaves: true});
    $intr.create_action('top', 'level1', '', {has_slaves: true});
    $intr.create_action('level1', 'level2', '', {has_slaves: true});
    $intr.create_action('level2', 'level3', '', {has_slaves: true});
    $intr.create_action('level3', 'level4', '', {has_slaves: true});
    $intr.create_action('level4', 'level5', '', {has_slaves: true});
    $intr.create_action('level5', 'level6', 'Ping.');
    $intr.create_action('seduce', 'seduce1', "If I told you you have a beautiful body, \nwould you hold it against me?", {effect_args: {happiness: 10}});
    $intr.create_action('seduce', 'seduce2', [['Suki',"I think it's the wrong game...?"],['Carol',"Who cares? Let's go tie someone up!"],["Suki","We must do our job first."],["Carol","And what's our job again?"],["Suki", "Demonstrating a longer dialogue."], ["Carol", "Laaaaaame!"]], {effect_args: {happiness: 10, boundary_happiness: [0,25]}});
    $intr.create_action('threaten', 'threaten1', "I'll turn you into a newt!", {effect_args: {fear: 5, extra: function(){$intr.set_internal_var('duck', 10)}}});
    $intr.create_action('threaten', 'threaten2', "I'll turn you into an ugly newt!", {rule_args: {fear: [50,100]}, effect_args: {fear: 20, anger: -10, happiness: -10}});
    $intr.create_action('top', 'Caroltest', 'Weeeee', {rule_args: {player_name: 'Carol'}});

    $intr.temp_player_name = $intr.player_name;
    $intr.create_action('top', 'Change!', [[1, 'Take over, will you?'], ['Carol', 'Sure thing!']], {extra: function(){$intr.player_name = 'Carol'}});

    $intr.temp_player_name = 'Carol';
    $intr.create_action('top', 'Change back!', [[1, 'Ok, bored now.'], [$intr.player_name, 'Sigh. So unreliable.']], {extra: function(){$intr.player_name = $intr.default_player_name}});
    $intr.create_action('top', 'Caroltest2', 'Woooo');
    $intr.temp_player_name = false;

    $intr.create_action('', 'start', 'ping', {sound: "Frog", animation: "test"});

    $intr.add_animation_frame('test', false, {delete_pic_nr: 4});
    $intr.add_animation_frame('test', 'bha1');
    $intr.add_animation_frame('test', 'ballgaga1', {rule_args: {gagged: 1}});
    $intr.add_animation_frame('test', 'blindfolda1', {rule_args: {blindfolded: 1}});
    $intr.add_animation_frame('test', false, {delay: 15});
    $intr.add_animation_frame('test', 'bha2');
    $intr.add_animation_frame('test', 'ballgaga2', {rule_args: {gagged: 1}});
    $intr.add_animation_frame('test', 'blindfolda2', {rule_args: {blindfolded: 1}});
    $intr.add_animation_frame('test', false, {delay: 15});
    $intr.add_animation_frame('test', 'bha3');
    $intr.add_animation_frame('test', 'ballgaga3', {rule_args: {gagged: 1}});
    $intr.add_animation_frame('test', 'blindfolda3', {rule_args: {blindfolded: 1}});
    $intr.add_animation_frame('test', false, {delay: 15});
    $intr.add_animation_frame('test', 'bh');
    $intr.add_animation_frame('test', 'ballgag', {rule_args: {gagged: 1}});
    $intr.add_animation_frame('test', 'blindfold', {rule_args: {blindfolded: 1}});
    $intr.add_animation_frame('test', 'bl1');

    $intr.add_animation_frame('blink', 'bl1', {delay: 7});
    $intr.add_animation_frame('blink', 'bl2', {delay: 7});
    $intr.add_animation_frame('blink', 'bl3', {delay: 7});
    $intr.add_animation_frame('blink', 'bl2', {delay: 7});
    $intr.add_animation_frame('blink', 'bl1');

    return $intr;
}

if(typeof Core === "undefined") //for cli testing
{
    $intr = new Interaction();
    $intr.create_action('top', 'Items', '', {has_slaves: true});
    $intr = Badger_Interactions['test']($intr);
    $intr.load_modifiers();
    $intr.start();
}
