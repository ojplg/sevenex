window.SEVENEX = {}

SEVENEX.init = function() {
    
    var nowTimeMillis = function(){
        var millis = Date.now();
	    return millis;
    }	

    var that = {};

    var restTimeSpan = 1 * 1000;
    var activityTimeSpan = 3 * 1000;

    var activityNames = [
    	"Jumping Jacks"
	    ,"Wall Sit"
	    ,"Push-ups"
	    ,"Abdominal Crunches"
	    ,"Step-up onto a Chair"
	    ,"Squats"
	    ,"Triceps Dip on a Chair"
	    ,"Plank"
	    ,"High Knees, Run in Place"
	    ,"Alternating Lunges"
	    ,"Push-ups with Rotation"
	    ,"Side Plank, Left"
	    ,"Side Plank, Right"
    ];

    var program;
    var progress;

    var newInterval = function(name){
        return {
            name: name,
            time: activityTimeSpan,
            isRest: false
        };
    }	

    var newRest = function(){
        return {
            name: "Rest",
            time: restTimeSpan,
            isRest: true
        };
    }

    var newProgram = function(names){
        var p = {};
        p.activities = names.flatMap(
                name => [ newInterval(name), newRest() ] );
        p.totalTime = p.activities.reduce(
                (sum,activity) => sum + activity.time );
        return p;
    }

    var newProgress = function(){
        var p = {};
        p.index = 0;
        p.nextRedrawTime = nowTimeMillis() - 1;
        p.running = false;

        p.toggle = function() {
            p.running = true;
        }

        return p;
    }

    var drawScreen = function(){
        console.log("Sevenex initializing");
        var body = document.getElementsByTagName('body');

        var topDiv = document.createElement('div');
        topDiv.innerHTML = "Sevenex. Countdown.";

    	var actDiv = document.createElement('div');
	    actDiv.id = 'actDiv';

        var controlDiv = document.createElement('div');
        controlDiv.id = 'controlDiv';

	    var nameSpan = document.createElement('span');
        nameSpan.id = 'nameSpan';

        var counterSpan = document.createElement('span');
        counterSpan.id = 'counterSpan';

	    actDiv.appendChild(nameSpan);
        actDiv.appendChild(counterSpan);

        var progressButton = document.createElement('button');
        progressButton.id = 'progressButton';
        progressButton.name = 'progress';
        progressButton.value = 'progress';
        progressButton.innerHTML = 'Start';
        progressButton.type = 'button';

        controlDiv.appendChild(progressButton);

        document.body.appendChild(topDiv);
        document.body.appendChild(document.createElement('hr'));
    	document.body.appendChild(actDiv);
        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(controlDiv);

    }

    var activityDiv = function(){

        if ( progress.running ){

            if ( nowTimeMillis() > progress.nextRedrawTime ) {
    
                var activity = program.activities[progress.index];
                progress.index++;
            
                var actSpan = document.getElementById('nameSpan');
                actSpan.innerHTML = activity.name;
                progress.nextRedrawTime = nowTimeMillis() + activity.time;
	        }
	
	        var remainingTime = Math.round(
                (progress.nextRedrawTime - nowTimeMillis()) / 1000);
	        var counterSpan = document.getElementById('counterSpan');
            counterSpan.innerHTML = "&nbsp;&nbsp;&nbsp;" + remainingTime;

        }
	    setTimeout(activityDiv, 50);
    }

    var start = function(){
	    drawScreen();
        program = newProgram(activityNames);
        progress = newProgress();
        var progressButton = document.getElementById('progressButton');
        progressButton.onclick = function(){ progress.toggle();  }
	    activityDiv();
    }

    that.start = start;

    return that;
};
