window.SEVENEX = {}

SEVENEX.init = function() {
    
    var that = {};

    var index = 0;
    var nextRedrawTime;
    var restTime;

    var restTimeSpan = 10 * 1000;
    var activityTimeSpan = 30 * 1000;

    var activities = [
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
	    ,"Side Plan"
    ];

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
        var seconds = new Date().getTime();
	return seconds;
    }	

    var activityDiv = function(){

        if ( nowTimeMillis() > nextRedrawTime ) {
            if ( restTime ) {
		nextRedrawTime = nowTimeMillis() + activityTimeSpan; 
		var name = activities[index];
                index++;
		restTime = false;

    	        var actDiv = document.getElementById('nameSpan');
                actDiv.innerHTML = name;
	    } else {
            
    	        var actDiv = document.getElementById('nameSpan');
                actDiv.innerHTML = "Rest";
                nextRedrawTime = nowTimeMillis() + restTimeSpan;		
                restTime = true;
            }

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
	activityDiv();
    }

    that.start = start;

    return that;
};
