window.SEVENEX = {}

SEVENEX.init = function() {
    
    var that = {};

    var index = 0;
    var nextRedrawTime;
    var restTime;

    var restTimeSpan = 10 * 1000;
    var activityTimeSpan = 30 * 1000;

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

    var activities;

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

    var drawScreen = function(){
        console.log("Sevenex initializing");
        var body = document.getElementsByTagName('body');

        var topDiv = document.createElement('div');
        topDiv.innerHTML = "Sevenex. Countdown.";

    	var actDiv = document.createElement('div');
	    actDiv.id = 'actDiv';

        document.body.appendChild(topDiv);
        document.body.appendChild(document.createElement('hr'));
    	document.body.appendChild(actDiv);

	    var nameSpan = document.createElement('span');
        nameSpan.id = 'nameSpan';

        var counterSpan = document.createElement('span');
        counterSpan.id = 'counterSpan';

	    actDiv.appendChild(nameSpan);
        actDiv.appendChild(counterSpan);
    }

    var nowTimeMillis = function(){
        var millis = Date.now();
	    return millis;
    }	

    var activityDiv = function(){

        if ( nowTimeMillis() > nextRedrawTime ) {
            var activity = activities[index];
            index++;
            
            var actSpan = document.getElementById('nameSpan');
            actSpan.innerHTML = activity.name;
            nextRedrawTime = nowTimeMillis() + activity.time;
	    }
	
	    var remainingTime = Math.round((nextRedrawTime - nowTimeMillis()) / 1000);
	    var counterSpan = document.getElementById('counterSpan');
        counterSpan.innerHTML = "&nbsp;&nbsp;&nbsp;" + remainingTime;

	    setTimeout(activityDiv, 50);
    }

    var start = function(){
	    drawScreen();
    	restTime = true;
	    nextRedrawTime = nowTimeMillis() - 1;
        activities = activityNames.flatMap( 
                name => [ newInterval(name), newRest() ] );
	    activityDiv();
    }

    that.start = start;

    return that;
};
