window.SEVENEX = {}

SEVENEX.init = function() {
    
    var nowTimeMillis = function(){
        var millis = Date.now();
	    return millis;
    }	

    var that = {};

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
        p.timeRemainingUntilNext = -1;
        p.lastMeasuredTime = nowTimeMillis();
        p.running = false;

        p.toggle = function() {
            p.running = ! p.running;

            var progressButton = document.getElementById('progressButton');
            progressButton.innerHTML = p.running ? "Pause" : "Resume";
            p.lastMeasuredTime = nowTimeMillis();
        }

        return p;
    }

    var drawScreen = function(){
        console.log("Sevenex initializing");
        var body = document.getElementsByTagName('body');

        var topDiv = document.createElement('div');
        topDiv.innerHTML = "Sevenex. Countdown.";

        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid';

        var leftColumnDiv = document.createElement('div');
        leftColumnDiv.id = 'left_column';

        var stagesDiv = document.createElement('div');
        stagesDiv.id = 'stagesDiv';
        leftColumnDiv.appendChild(stagesDiv);

    	var actDiv = document.createElement('div');
	    actDiv.id = 'actDiv';

	    var nameSpan = document.createElement('div');
        nameSpan.id = 'nameSpan';
        nameSpan.className = 'activity_name';

        var counterSpan = document.createElement('div');
        counterSpan.id = 'counterSpan';
        counterSpan.className = 'activity_time_left';

	    actDiv.appendChild(nameSpan);
        actDiv.appendChild(counterSpan);

        var progressButton = document.createElement('button');
        progressButton.id = 'progressButton';
        progressButton.name = 'progress';
        progressButton.value = 'progress';
        progressButton.innerHTML = 'Start';
        progressButton.type = 'button';
        progressButton.className = 'progress_button';

        var controlDiv = document.createElement('div');
        controlDiv.id = 'controlDiv';
        controlDiv.appendChild(progressButton);

        actDiv.appendChild(controlDiv);

        gridDiv.appendChild(leftColumnDiv);
        gridDiv.appendChild(actDiv);

        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(topDiv);
        document.body.appendChild(document.createElement('hr'));
    	document.body.appendChild(gridDiv);

    }

    var activityDiv = function(){

        if ( progress.running ){
            
            var timeElapsed = nowTimeMillis() - progress.lastMeasuredTime;
            progress.lastMeasuredTime = nowTimeMillis();

            if ( 0 > progress.timeRemainingUntilNext ) {
    
                var activity = program.activities[progress.index];
                progress.index++;
            
                var actSpan = document.getElementById('nameSpan');
                actSpan.innerHTML = activity.name;
                progress.timeRemainingUntilNext = activity.time;
	        }
	
	        var remainingTime = Math.round( progress.timeRemainingUntilNext / 1000);
	        var counterSpan = document.getElementById('counterSpan');
            counterSpan.innerHTML = "&nbsp;&nbsp;&nbsp;" + remainingTime;
            progress.timeRemainingUntilNext -= timeElapsed;

        }
	    setTimeout(activityDiv, 25);
    }


    var populateStages = function(activityNames){
        var stagesDiv = document.getElementById('stagesDiv');
        activityNames.forEach( name => {
            var actDiv = document.createElement('div');
            actDiv.innerHTML = name;
            stagesDiv.appendChild(actDiv);
        });   
    }


    var start = function(){
	    drawScreen();
        program = newProgram(activityNames);
        populateStages(activityNames);
        progress = newProgress();
        var progressButton = document.getElementById('progressButton');
        progressButton.onclick = function(){ progress.toggle();  }
	    activityDiv();
    }

    that.start = start;

    return that;
};
