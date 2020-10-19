window.SEVENEX = {}

SEVENEX.init = function() {
    
    var that = {};

    let tick = new Audio('tick.mp3');
    let bark = new Audio('bark.mp3');

    var nowTimeMillis = function(){
        var millis = Date.now();
        return millis;
    }    

    var loadedWorkouts;
    var program;
    var progress;

    var defaultWorkout = {
        "name":"Default",
        "activities":
        [
                {"name":"Jumping Jacks","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Wall Sit","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Push-ups","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Abdominal Crunches","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Step-up onto a Chair","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Squats","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Triceps Dip on a Chair","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Plank","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"High Knees, Run in Place","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Alternating Lunges","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Push-ups with Rotation","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Side Plank, Left","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
                ,{"name":"Side Plank, Right","time":30,"isRest":false}
                ,{"name":"Rest","time":10,"isRest":true}
       ]
    };
   
    var loadRemoteWorkouts = function(){

        var workoutsLoaded = function(){
            console.log("WORKOUTS LOADED");
            workoutsList = JSON.parse(this.responseText);
            loadedWorkouts = workoutsList.map( a => workoutToProgram(a, 1000));
            loadedWorkouts.unshift(defaultProgram);
            populateWorkoutSelector();
        }

        let requester = new XMLHttpRequest();
        requester.addEventListener("load", workoutsLoaded);
        requester.open("GET", "/sevenex/workouts/");
        requester.send();
    }

    var formatTime = function(millis){
        let totalSeconds = Math.round(millis/1000);
        let minutes = totalSeconds > 60 ?
                Math.floor(totalSeconds/60) : 0;
        let seconds = totalSeconds%60;
        let secondsF = seconds >= 10 ? seconds : "0" + seconds;

        return minutes + ":" + secondsF;
    }

    var workoutToProgram = function(p, scale){
        
        p.activities.forEach( act => act.time *= scale );

        p.totalTime = p.activities.reduce(
                (sum,activity) => sum + activity.time, 0 );

        p.activityNames = p.activities.reduce(
            (accum,activity) => {
                if(!activity.isRest)
                    accum.push(activity.name);
                    return accum;
                } , []);

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

    let defaultProgram = workoutToProgram(defaultWorkout, 1000);

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
            if( newRemainingSeconds >= 0 &&
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

    var selectWorkoutCallback = function(evt){
        console.log('selected ' + evt.target.value);
        var selectedProgram = loadedWorkouts.find( program =>
            program.name == evt.target.value);
        setActiveProgram(selectedProgram);
    }

    var drawScreen = function(){
        console.log("Sevenex initializing");
        var body = document.getElementsByTagName('body');

        var topDiv = document.createElement('div');
        var topTitleSpan = document.createElement('span');
        topTitleSpan.id = 'topTitle';
        topTitleSpan.innerHTML = 
            "<b>Sevenex.</b> An application for quick interval workouts.";
        topDiv.appendChild(topTitleSpan);
        var selectWorkoutSpan = document.createElement('span');
        selectWorkoutSpan.id = 'selectWorkout';
        var selectWorkoutSelector = document.createElement('select');
        selectWorkoutSelector.id = 'selectWorkoutSelector';
        selectWorkoutSelector.addEventListener('change', selectWorkoutCallback);
        selectWorkoutSpan.appendChild(selectWorkoutSelector);
        topDiv.appendChild(selectWorkoutSpan);

        var gridDiv = document.createElement('div');
        gridDiv.className = 'grid';

        var leftColumnDiv = document.createElement('div');
        leftColumnDiv.id = 'left_column';

        let programStatsDiv = document.createElement('div');
        programStatsDiv.id = 'programStatsDiv';

        let configDiv = document.createElement('div');
        configDiv.id = 'configDiv';

        var stagesDiv = document.createElement('div');
        stagesDiv.id = 'stagesDiv';
        
        leftColumnDiv.appendChild(programStatsDiv);
        leftColumnDiv.appendChild(document.createElement('hr'));
        leftColumnDiv.appendChild(configDiv);
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

        let controlDiv = document.createElement('div');
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

            var totalRemainingMillis = program.totalTime - progress.totalTimeElapsed;
            var totalRemainingTime = formatTime ( totalRemainingMillis );
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

    var newStatDiv = function(baseId, labelName ){
        let newDiv = document.createElement('div');
        newDiv.id = baseId + 'Div';
        let labelSpan = document.createElement('span');
        labelSpan.id = baseId + "LabelSpan";
        labelSpan.innerHTML = labelName;
        newDiv.appendChild(labelSpan);
        let valueSpan = document.createElement('span');
        valueSpan.id = baseId + "ValueSpan";
        valueSpan.className = 'left_column_value'
        newDiv.appendChild(valueSpan);
    
        return newDiv;
    }

    var setStatValue = function(baseId, value){
        var valueSpan = document.getElementById(baseId + "ValueSpan");
        valueSpan.innerHTML = value;
    }

    var initStats = function(){

        let statsDiv = document.getElementById('programStatsDiv');
        
        let totalTimeDiv = newStatDiv("totalTime", "Total Time");
        statsDiv.appendChild(totalTimeDiv);

        let elapsedTimeDiv = newStatDiv("elapsedTime", "Elapsed Time");
        statsDiv.appendChild(elapsedTimeDiv);

        let remainingTimeDiv = newStatDiv("totalRemainingTime", "Remaining Time");
        statsDiv.appendChild(remainingTimeDiv);

        let percentCompleteDiv = newStatDiv("percentComplete", "Percent Complete");
        statsDiv.appendChild(percentCompleteDiv);
    }

    var renderInitialStatValues = function(program){
        setStatValue("totalTime", formatTime(program.totalTime));
        setStatValue("elapsedTime", formatTime(0));
        setStatValue("totalRemainingTime", formatTime(program.totalTime));
        setStatValue("percentComplete", "0");
    }

    var clearStages = function(){
        var stagesDiv = document.getElementById('stagesDiv');
        stagesDiv.innerHTML = '';
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

    var populateWorkoutSelector = function(){
        var selector = document.getElementById('selectWorkoutSelector');

        loadedWorkouts.forEach( function(workout){
            var option = document.createElement('option');
            option.value = workout.name;
            option.innerHTML = workout.name;
            selector.appendChild(option);
        });
    }

    var initControls = function(){
        var randomizeButton = document.createElement('button');
        randomizeButton.innerHTML = "Randomize";
        randomizeButton.onclick = randomizeActivities;
        
        var configDiv = document.getElementById('configDiv');
        configDiv.appendChild(randomizeButton);
    }

    var shuffle = function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    var randomizeActivities = function(){
        console.log("randomizing");

        let filtered = program.activities.filter(
            activity => ! activity.isRest);

        let randomized = shuffle(filtered);
        var index = 0;

        let activities = program.activities.map(
            act => {
                if ( act.isRest ){
                    return act;
                } else {
                    var next =  randomized[index];
                    index++;
                    return next;
                }
            });
        
        var randomOrderWorkout = {};
        randomOrderWorkout.name = program.name;
        randomOrderWorkout.activities = activities;

        var randomOrderProgram = workoutToProgram( randomOrderWorkout, 1 );
        setActiveProgram(randomOrderProgram);
    }

    var setActiveProgram = function(selectedProgram){
        program = selectedProgram;
        renderInitialStatValues(program);
        initControls();
        clearStages();
        initStages(program.activityNames);
        progress = newProgress();
        activityDiv();
    }

    var start = function(){
        loadRemoteWorkouts();
        drawScreen();
        initStats();
        var progressButton = document.getElementById('progressButton');
        progressButton.onclick = function(){ progress.toggle();  }
        setActiveProgram(defaultProgram);
    }

    that.start = start;

    return that;
};
