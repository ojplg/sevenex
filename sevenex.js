window.SEVENEX = {}

SEVENEX.init = function() {
    
    var nowTimeMillis = function(){
        var millis = Date.now();
	    return millis;
    }	

    var formatTime = function(millis){
        let totalSeconds = Math.round(millis/1000);
        let minutes = totalSeconds > 60 ?
                Math.round(totalSeconds/60) : 0;
        let seconds = totalSeconds%60;
        let secondsF = seconds >= 10 ? seconds : "0" + seconds;

        return minutes + ":" + secondsF;
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
                (sum,activity) => sum + activity.time, 0 );
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

        let programStatsDiv = document.createElement('div');
        programStatsDiv.id = 'programStatsDiv';

        var stagesDiv = document.createElement('div');
        stagesDiv.id = 'stagesDiv';
        
        leftColumnDiv.appendChild(programStatsDiv);
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

        let creditDiv = document.createElement('div');
        creditDiv.id = 'creditDiv';
        creditDiv.innerHTML = 
            'Code on <a href="https://github.com/ojplg/sevenex">github</a>.'
            + 'Patches welcome!';

        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(topDiv);
        document.body.appendChild(document.createElement('hr'));
    	document.body.appendChild(gridDiv);
        document.body.appendChild(creditDiv);

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
	
	        var remainingTime = formatTime( progress.timeRemainingUntilNext );
	        var counterSpan = document.getElementById('counterSpan');
            counterSpan.innerHTML = "&nbsp;&nbsp;&nbsp;" + remainingTime;
            progress.timeRemainingUntilNext -= timeElapsed;

        }
	    setTimeout(activityDiv, 25);
    }


    var populateStats = function(program){
        let statsDiv = document.getElementById('programStatsDiv');
        statsDiv.innerHTML = "TOTAL TIME " + formatTime(program.totalTime)
            + "<br/><hr/>";
        ;
    }

    var populateStages = function(activityNames){
        var stagesDiv = document.getElementById('stagesDiv');
        var index = 1;
        activityNames.forEach( name => {
            var actDiv = document.createElement('div');
            actDiv.innerHTML = index + ") " + name;
            index++;
            stagesDiv.appendChild(actDiv);
        });   
    }


    var start = function(){
	    drawScreen();
        program = newProgram(activityNames);
        populateStats(program);
        populateStages(activityNames);
        progress = newProgress();
        var progressButton = document.getElementById('progressButton');
        progressButton.onclick = function(){ progress.toggle();  }
	    activityDiv();
    }

    that.start = start;

    return that;
};
