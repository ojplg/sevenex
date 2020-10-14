window.SEVENEX = {}

SEVENEX.init = function() {
    
    var that = {};

    var index = 0;
    var nextRedrawTime;
    var restTime;

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
    }

    var nowTime = function(){
        var seconds = new Date().getTime() / 1000;
	return seconds;
    }	

    var activityDiv = function(){
	if ( nowTime() > nextRedrawTime ) {
            if ( restTime ) {
		nextRedrawTime = nowTime() + 3;
		var name = activities[index];
                index++;
		restTime = false;

    	        var actDiv = document.getElementById('actDiv');
                actDiv.innerHTML = name;
	    } else {
            
    	        var actDiv = document.getElementById('actDiv');
                actDiv.innerHTML = "Rest";
                nextRedrawTime = nowTime() + 3;		
                restTime = true;
            }

	}
	
	setTimeout(activityDiv, 500);
    }

    var start = function(){
	drawScreen();
	restTime = true;
	nextRedrawTime = nowTime() - 1;
	activityDiv();
    }

    that.start = start;

    return that;
};
