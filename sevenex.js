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

    var timerScreen;
    var contentDiv;

    var defaultWorkout = {
        "name":"Default",
        "activities":
        [
                {"name":"Rest","time":10,"isRest":true}
                ,{"name":"Jumping Jacks","time":30,"isRest":false}
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

        p.priorNonRestActivity = function(index){
            index--;
            var priorThing = p.activities[index];
            while(priorThing){
                if(priorThing.isRest){
                    index--;
                    priorThing = p.activities[index];
                } else {
                    return priorThing;
                }
            }
            return null;
        }

        return p;
    }

    let defaultProgram = workoutToProgram(defaultWorkout, 1000);

    function Progress(){
        this.index = 0;
        this.timeRemainingUntilNext = -1;
        this.lastMeasuredTime = nowTimeMillis();
        this.running = false;
        this.totalTimeElapsed = 0;

        this.toggle = function() {
            this.running = ! this.running;

            var progressButton = document.getElementById('progressButton');
            progressButton.innerHTML = this.running ? "Pause" : "Resume";
            this.lastMeasuredTime = nowTimeMillis();
        }

        this.advanceTime = function(){
            let now = nowTimeMillis(); 
            let timeElapsed = now - this.lastMeasuredTime;
            this.totalTimeElapsed += timeElapsed;
            this.lastMeasuredTime = now;
            let oldRemainingSeconds = Math.round(this.timeRemainingUntilNext/1000);
            this.timeRemainingUntilNext -= timeElapsed;         
            let newRemainingSeconds = Math.round(this.timeRemainingUntilNext/1000);
            if( newRemainingSeconds >= 0 &&
                newRemainingSeconds < 5 &&
                newRemainingSeconds != oldRemainingSeconds ){
                tick.play();
            }

            let next = this.timeRemainingUntilNext < 0;
            if (next) {
                bark.play();
            }
            return next;
        }
    }

    var selectWorkoutCallback = function(evt){
        console.log('selected ' + evt.target.value);
        var selectedProgram = loadedWorkouts.find( program =>
            program.name == evt.target.value);
        setActiveProgram(selectedProgram);
    }

    function StagesPanel(){    
        this.stagesDiv = document.createElement('div');
        this.stagesDiv.id = 'stagesDiv';

        this.clear = function(){ this.stagesDiv.innerHTML = ''; }

        this.setStages = function(activityNames){
            var index = 1;
            activityNames.forEach( name => {
                var actDiv = document.createElement('div');
                actDiv.innerHTML = index + ") " + name;
                index++;
                this.stagesDiv.appendChild(actDiv);
                this[name] = actDiv;
            });   
        }

        this.setCurrentActivity = function(activityName){
            this[activityName].className = "currentActivity";
        }

        this.setCompletedActivity = function(activityName){
            this[activityName].className = "completedActivity";
        }
    }

    function StatsPanel(){

        this.programStatsDiv = document.createElement('div');
        this.programStatsDiv.id = 'programStatsDiv';

        this.newStatDiv = function(baseId, labelName ){
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
            
            this[valueSpan.id] = valueSpan;

            return newDiv;
        }

        this.setStatValue = function(baseId, value){
            var valueSpan = this[baseId + "ValueSpan"];
            valueSpan.innerHTML = value;
        }

        this.renderInitialStatValues = function(program){
            this.setStatValue("totalTime", 
                    formatTime(program.totalTime));
            this.setStatValue("elapsedTime", formatTime(0));
            this.setStatValue("totalRemainingTime", 
                    formatTime(program.totalTime));
            this.setStatValue("percentComplete", "0");
        }


        this.totalTimeDiv = this.newStatDiv("totalTime", "Total Time");
        this.programStatsDiv.appendChild(this.totalTimeDiv);

        this.elapsedTimeDiv = this.newStatDiv("elapsedTime", "Elapsed Time");
        this.programStatsDiv.appendChild(this.elapsedTimeDiv);

        this.remainingTimeDiv = this.newStatDiv("totalRemainingTime", "Remaining Time");
        this.programStatsDiv.appendChild(this.remainingTimeDiv);

        this.percentCompleteDiv = this.newStatDiv("percentComplete", "Percent Complete");
        this.programStatsDiv.appendChild(this.percentCompleteDiv);

        this.updateStats = function( progress, program ){
            var elapsedTime = formatTime ( progress.totalTimeElapsed );
            this.elapsedTimeValueSpan.innerHTML = elapsedTime;

            var totalRemainingMillis = program.totalTime - progress.totalTimeElapsed;
            var totalRemainingTime = formatTime ( totalRemainingMillis );
            this.totalRemainingTimeValueSpan.innerHTML = totalRemainingTime;
    
            var percentComplete = Math.round(100*
                progress.totalTimeElapsed/program.totalTime);
            this.percentCompleteValueSpan.innerHTML = percentComplete;
        }
    }

    function TimerScreen(){

        var leftColumnDiv = document.createElement('div');
        leftColumnDiv.id = 'left_column';

        let configDiv = document.createElement('div');
        configDiv.id = 'configDiv';

        var randomizeButton = document.createElement('button');
        randomizeButton.innerHTML = "Randomize";
        randomizeButton.onclick = randomizeActivities;
        
        configDiv.appendChild(randomizeButton);
      
        this.stagesPanel = new StagesPanel();

        this.statsPanel = new StatsPanel();

        leftColumnDiv.appendChild(this.statsPanel.programStatsDiv);
        leftColumnDiv.appendChild(document.createElement('hr'));
        leftColumnDiv.appendChild(configDiv);
        leftColumnDiv.appendChild(document.createElement('hr'));
        leftColumnDiv.appendChild(this.stagesPanel.stagesDiv);

        var actDiv = document.createElement('div');
        actDiv.id = 'actDiv';

        this.nameDiv = document.createElement('div');
        this.nameDiv.id = 'nameDiv';
        this.nameDiv.className = 'activity_name';
        this.nameDiv.innerHTML = '&nbsp;';
    
        var counterDiv = document.createElement('div');
        counterDiv.id = 'counterDiv';
        counterDiv.className = 'activity_time_left';
        counterDiv.innerHTML = '&nbsp;';

        this.nextActivityDiv = document.createElement('div');
        this.nextActivityDiv.id = 'nextActivityDiv';
        this.nextActivityDiv.innerHTML = '&nbsp;';

        actDiv.appendChild(this.nameDiv);
        actDiv.appendChild(counterDiv);
        actDiv.appendChild(this.nextActivityDiv);

        var progressButton = document.createElement('button');
        progressButton.id = 'progressButton';
        progressButton.name = 'progress';
        progressButton.value = 'progress';
        progressButton.innerHTML = 'Start';
        progressButton.type = 'button';
        progressButton.className = 'progress_button';
        progressButton.onclick = function(){ progress.toggle();  }

        let controlDiv = document.createElement('div');
        controlDiv.id = 'controlDiv';
        controlDiv.appendChild(progressButton);

        actDiv.appendChild(controlDiv);

        this.gridDiv = document.createElement('div');
        this.gridDiv.className = 'grid';
        this.gridDiv.appendChild(leftColumnDiv);
        this.gridDiv.appendChild(actDiv);

        this.setActivityNames = function(currentActivity, nextActivity){
            this.nameDiv.innerHTML = currentActivity;
            this.nextActivityDiv.innerHTML = nextActivity;
        };
    }

    function FormScreen(){
        let returnButton = document.createElement('button');
        returnButton.id = 'returnButton';
        returnButton.innerHTML = 'Return';
        returnButton.onclick = function(){ renderTimerScreen(); }
    
        let formHeaderDiv = document.createElement('div');
        formHeaderDiv.appendChild(returnButton);
        
        this.formScreenDiv = document.createElement('div');
        this.formScreenDiv.appendChild(formHeaderDiv);
    }   


    var drawScreen = function(){
        console.log("Sevenex initializing");

        let topDiv = document.createElement('div');
        let topTitleSpan = document.createElement('span');
        topTitleSpan.id = 'topTitle';
        topTitleSpan.innerHTML = 
            "<b>Sevenex.</b> An application for quick interval workouts.";
        topDiv.appendChild(topTitleSpan);
        let selectWorkoutSpan = document.createElement('span');
        selectWorkoutSpan.id = 'selectWorkout';
        let selectWorkoutSelector = document.createElement('select');
        selectWorkoutSelector.id = 'selectWorkoutSelector';
        selectWorkoutSelector.addEventListener('change', selectWorkoutCallback);
        selectWorkoutSpan.appendChild(selectWorkoutSelector);
        topDiv.appendChild(selectWorkoutSpan);
        let newWorkoutButton = document.createElement('button');
        newWorkoutButton.id = 'newWorkoutButton';
        newWorkoutButton.innerHTML = 'New';
        newWorkoutButton.onclick = renderFormScreen;
        selectWorkoutSpan.appendChild(newWorkoutButton);

        let creditDiv = document.createElement('div');
        creditDiv.id = 'creditDiv';
        creditDiv.innerHTML = 
            'Code on <a href="https://github.com/ojplg/sevenex">github</a>.'
            + 'Patches welcome!';

        contentDiv = document.createElement('div');
        contentDiv.id = 'contentDiv';

        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(topDiv);
        document.body.appendChild(document.createElement('hr'));
        document.body.appendChild(contentDiv);
        document.body.appendChild(creditDiv);
    }

    var timerLoop = function(){

        if ( progress.running ){
            
            let next = progress.advanceTime();

            if ( next ) {
                let priorActivity = program.priorNonRestActivity(progress.index);
                if ( priorActivity != null ) {
                    timerScreen.stagesPanel.setCompletedActivity(priorActivity.name);
                }
                var activity = program.activities[progress.index];
                var nextActivity = program.nextNonRestActivity(progress.index);
                if ( ! activity.isRest ){
                    timerScreen.stagesPanel.setCurrentActivity(activity.name);
                } else {
                    timerScreen.stagesPanel.setCurrentActivity(nextActivity.name);
                }
                progress.index++;
                progress.timeRemainingUntilNext = activity.time;
                
                var nextActivityName = nextActivity ?
                    'Next:&nbsp;' + nextActivity.name : '';

                timerScreen.setActivityNames(activity.name,nextActivityName);
            }
    
            timerScreen.statsPanel.updateStats(progress, program);

            var remainingTime = formatTime( progress.timeRemainingUntilNext );
            var counterDiv = document.getElementById('counterDiv');
            counterDiv.innerHTML = remainingTime;

        }

        setTimeout(timerLoop, 25);
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

    var renderFormScreen = function() {
        contentDiv.innerHTML = '';
        let formScreen = new FormScreen();
        contentDiv.appendChild(formScreen.formScreenDiv);
    }

    var renderTimerScreen = function() {
        contentDiv.innerHTML = ''; 
        timerScreen = new TimerScreen();
        contentDiv.appendChild(timerScreen.gridDiv);

        setActiveProgram(defaultProgram);
    }

    var setActiveProgram = function(selectedProgram){
        program = selectedProgram;
        timerScreen.statsPanel.renderInitialStatValues(program);
        timerScreen.stagesPanel.clear();
        timerScreen.stagesPanel.setStages(program.activityNames);
        progress = new Progress();
        timerLoop();
    }

    var start = function(){
        loadRemoteWorkouts();
        drawScreen();
        renderTimerScreen();
    }

    that.start = start;

    return that;
};
