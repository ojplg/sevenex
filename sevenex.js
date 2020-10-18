window.SEVENEX = {}

SEVENEX.init = function() {
    
    var nowTimeMillis = function(){
        var millis = Date.now();
	    return millis;
    }	


    var loadRemoteWorkouts = function(){

        var workoutsLoaded = function(){
            console.log("WORKOUTS LOADED " + this.responseText);
        }

        let requester = new XMLHttpRequest();
        requester.addEventListener("load", workoutsLoaded);
        requester.open("GET", "/workouts");
        requester.send();
    }

    let tick = new Audio('tick.mp3');
    let bark = new Audio('bark.mp3');

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

        p.nextNonRestActivity = function(index){
            index++;
            var nextThing = p.activities[index]
            while (nextThing){
                if( nextThing.isRest ){
                    index++;
                    nextThing = p.activities[index];
                } else {
                    return nextThing;
                }
            }
            return null;
        }        

        return p;
    }

    var newProgress = function(){
        var p = {};
        p.index = 0;
        p.timeRemainingUntilNext = -1;
        p.lastMeasuredTime = nowTimeMillis();
        p.running = false;
        p.totalTimeElapsed = 0;

        p.toggle = function() {
            p.running = ! p.running;

            var progressButton = document.getElementById('progressButton');
            progressButton.innerHTML = p.running ? "Pause" : "Resume";
            p.lastMeasuredTime = nowTimeMillis();
        }

        p.advanceTime = function(){
            let now = nowTimeMillis(); 
            let timeElapsed = now - p.lastMeasuredTime;
            p.totalTimeElapsed += timeElapsed;
            p.lastMeasuredTime = now;
            let oldRemainingSeconds = Math.round(p.timeRemainingUntilNext/1000);
            p.timeRemainingUntilNext -= timeElapsed;         
            let newRemainingSeconds = Math.round(p.timeRemainingUntilNext/1000);
            if( newRemainingSeconds > 0 &&
                newRemainingSeconds < 5 &&
                newRemainingSeconds != oldRemainingSeconds ){
                tick.play();
            }

            let next = p.timeRemainingUntilNext < 0;
            if (next) {
                bark.play();
            }
            return next;
        }

        return p;
    }

    var drawScreen = function(){
        console.log("Sevenex initializing");
        var body = document.getElementsByTagName('body');

        var topDiv = document.createElement('div');
        topDiv.innerHTML = "<b>Sevenex.</b> An application for quick interval workouts.";

        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid';

        var leftColumnDiv = document.createElement('div');
        leftColumnDiv.id = 'left_column';

        let programStatsDiv = document.createElement('div');
        programStatsDiv.id = 'programStatsDiv';

        var stagesDiv = document.createElement('div');
        stagesDiv.id = 'stagesDiv';
        
        leftColumnDiv.appendChild(programStatsDiv);
        leftColumnDiv.appendChild(document.createElement('hr'));
        leftColumnDiv.appendChild(stagesDiv);

    	var actDiv = document.createElement('div');
	    actDiv.id = 'actDiv';

	    var nameDiv = document.createElement('div');
        nameDiv.id = 'nameDiv';
        nameDiv.className = 'activity_name';
        nameDiv.innerHTML = '&nbsp;';
    
        var counterDiv = document.createElement('div');
        counterDiv.id = 'counterDiv';
        counterDiv.className = 'activity_time_left';
        counterDiv.innerHTML = '&nbsp;';

        let nextActivityDiv = document.createElement('div');
        nextActivityDiv.id = 'nextActivityDiv';
        nextActivityDiv.innerHTML = '&nbsp;';

	    actDiv.appendChild(nameDiv);
        actDiv.appendChild(counterDiv);
        actDiv.appendChild(nextActivityDiv);

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
            
            let next = progress.advanceTime();

            if ( next ) {
    
                var activity = program.activities[progress.index];
                var nextActivity = program.nextNonRestActivity(progress.index);
                progress.index++;
            
                var actSpan = document.getElementById('nameDiv');
                actSpan.innerHTML = activity.name;
                progress.timeRemainingUntilNext = activity.time;

                var nextActSpan = document.getElementById('nextActivityDiv');
                if ( nextActivity ){
                    nextActSpan.innerHTML = 'Next: ' + nextActivity.name;
                } else {
                    nextActSpan.innerHTML = '';
                }
	        }
	
	        var remainingTime = formatTime( progress.timeRemainingUntilNext );
	        var counterDiv = document.getElementById('counterDiv');
            counterDiv.innerHTML = remainingTime;

            var elapsedTime = formatTime ( progress.totalTimeElapsed );
            var elapsedTimeValueSpan = document.getElementById('elapsedTimeValueSpan');
            elapsedTimeValueSpan.innerHTML = elapsedTime;

            var totalRemainingTime = formatTime (
                program.totalTime - progress.totalTimeElapsed );
            var totalRemainingValueSpan = document.getElementById(
                'totalRemainingTimeValueSpan');
            totalRemainingValueSpan.innerHTML = totalRemainingTime;
    
            var percentComplete = Math.round(100*
                progress.totalTimeElapsed/program.totalTime);
            var percentCompleteValueSpan = document.getElementById(
                'percentCompleteValueSpan');
            percentCompleteValueSpan.innerHTML = percentComplete;
        }

	    setTimeout(activityDiv, 25);
    }


    var newStatDiv = function(baseId, labelName, value){
        let newDiv = document.createElement('div');
        newDiv.id = baseId + 'Div';
        let labelSpan = document.createElement('span');
        labelSpan.id = baseId + "LabelSpan";
        labelSpan.innerHTML = labelName;
        newDiv.appendChild(labelSpan);
        let valueSpan = document.createElement('span');
        valueSpan.id = baseId + "ValueSpan";
        valueSpan.className = 'left_column_value'
        valueSpan.innerHTML = value;
        newDiv.appendChild(valueSpan);
    
        return newDiv;
    }

    var initStats = function(program){
        let statsDiv = document.getElementById('programStatsDiv');
        
        let totalTimeDiv = newStatDiv("totalTime", "Total Time",
            formatTime(program.totalTime));
        statsDiv.appendChild(totalTimeDiv);

        let elapsedTimeDiv = newStatDiv("elapsedTime", "Elapsed Time",
            formatTime(0));
        statsDiv.appendChild(elapsedTimeDiv);

        let remainingTimeDiv = newStatDiv("totalRemainingTime", "Remaining Time",
            formatTime(program.totalTime));
        statsDiv.appendChild(remainingTimeDiv);

        let percentCompleteDiv = newStatDiv("percentComplete", "Percent Complete", "0");
        statsDiv.appendChild(percentCompleteDiv);
    }

    var initStages = function(activityNames){
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
        loadRemoteWorkouts();
	    drawScreen();
        program = newProgram(activityNames);
        initStats(program);
        initStages(activityNames);
        progress = newProgress();
        var progressButton = document.getElementById('progressButton');
        progressButton.onclick = function(){ progress.toggle();  }
	    activityDiv();
    }

    that.start = start;

    return that;
};
