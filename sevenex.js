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
    var topNavControlsSpan;

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
        requester.open("GET", "/sevenex/workouts");
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

        p.nextNonRestIndex = function(index){
            index++;
            var nextThing = p.activities[index]
            while (nextThing){
                if( index >= p.activities.length ){
                    break;
                }
                if( nextThing.isRest ){
                    index++;
                    nextThing = p.activities[index];
                } else {
                    return index;
                }
            }
            return p.activities.length;
        }

        p.nextNonRestActivity = function(index){
            var nextIndex = p.nextNonRestIndex(index);
            return p.activities[nextIndex];
        }        

        p.priorNonRestIndex = function(index){
            index--;
            var priorThing = p.activities[index];
            while(priorThing){
                if(priorThing.isRest){
                    index--;
                    priorThing = p.activities[index];
                } else {
                    return index;
                }
            }
            index = 0;
            priorThing = p.activities[index];
            while ( priorThing.isRest ){
                index++;
                priorThing = p.activities[index];
            }
            return index;
        }
        
        p.priorNonRestActivity = function(index){
            var priorIndex = p.priorNonRestIndex(index);
            return p.activities[priorIndex];
        }

        return p;
    }

    let defaultProgram = workoutToProgram(defaultWorkout,1000);

    function Progress(){
        this.index = 0;
        this.timeRemainingUntilNext = program.activities[0].time; 
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
    
        this.recalculateTotalTimeElapsed = function(program){
            this.totalTimeElapsed = 0;
            for( var i=0; i<this.index; i++ ){
                var activity = program.activities[i];
                this.totalTimeElapsed += activity.time;
            }
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

        this.currentIndex = 0;

        this.setStages = function(activityNames){
            var index = 1;
            activityNames.forEach( name => {
                var actDiv = document.createElement('div');
                actDiv.innerHTML = index + ") " + name;
                index++;
                this.stagesDiv.appendChild(actDiv);
                this[name] = actDiv;
                actDiv.activityName = name;
            });
            this.stagesDiv.children[0].className = 'currentActivity';
        }

        this.advance = function(){
            this.stagesDiv.children[this.currentIndex].className = 'completedActivity';
            this.currentIndex++;
            this.stagesDiv.children[this.currentIndex].className = 'currentActivity';
        }

        this.rewind = function(){
            this.stagesDiv.children[this.currentIndex].className = 'upcoming';
            this.currentIndex--;
            this.stagesDiv.children[this.currentIndex].className = 'currentActivity';
        }

        this.complete = function(){
            this.stagesDiv.children[this.currentIndex].className = 'completedActivity';
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

        this.totalTimeDiv = this.newStatDiv("totalTime", "Total Time");
        this.programStatsDiv.appendChild(this.totalTimeDiv);

        this.elapsedTimeDiv = this.newStatDiv("elapsedTime", "Elapsed Time");
        this.programStatsDiv.appendChild(this.elapsedTimeDiv);

        this.remainingTimeDiv = this.newStatDiv("totalRemainingTime", "Remaining Time");
        this.programStatsDiv.appendChild(this.remainingTimeDiv);

        this.percentCompleteDiv = this.newStatDiv("percentComplete", "Percent Complete");
        this.programStatsDiv.appendChild(this.percentCompleteDiv);

        this.updateCounters = function( counters ){
            this.totalTimeValueSpan.innerHTML = counters.totalTime;
            this.elapsedTimeValueSpan.innerHTML = counters.elapsedTime;
            this.totalRemainingTimeValueSpan.innerHTML = counters.totalRemainingTime;
            this.percentCompleteValueSpan.innerHTML = counters.percentComplete;
        }
    }

    function Counters( progress, program ){
        this.totalTime = formatTime( program.totalTime );
        this.elapsedTime = formatTime( progress.totalTimeElapsed );
        let totalRemainingMillis = program.totalTime - progress.totalTimeElapsed;
        this.totalRemainingTime = formatTime ( totalRemainingMillis );
        this.percentComplete = Math.round( 100 *
                progress.totalTimeElapsed/program.totalTime);
        this.timeRemainingInInterval = 
                formatTime( progress.timeRemainingUntilNext );
    }

    function SituationPanel(){
        this.situationDiv = document.createElement('div');
        this.situationDiv.id = 'situationDiv';

        this.nameDiv = document.createElement('div');
        this.nameDiv.id = 'nameDiv';
        this.nameDiv.className = 'activity_name';
        this.nameDiv.innerHTML = '&nbsp;';
    
        this.counterGridDiv = document.createElement('div');
        this.counterGridDiv.className = 'counterGrid';         

        this.counterLabelDiv = document.createElement('div');
        this.counterLabelDiv.className = 'situation_counter_label';
        this.counterLabelDiv.innerHTML = 'Interval Time Left';

        this.counterDiv = document.createElement('div');
        this.counterDiv.id = 'counterDiv';
        this.counterDiv.className = 'situation_counter_value';
        this.counterDiv.innerHTML = '&nbsp;';

        this.counterHolderDiv = document.createElement('div');
        this.counterHolderDiv.appendChild(this.counterLabelDiv);
        this.counterHolderDiv.appendChild(this.counterDiv);
        this.counterHolderDiv.className = 'situation_counter_holder';

        this.totalElapsedLabelDiv = document.createElement('div');
        this.totalElapsedLabelDiv.className = 'situation_counter_label';
        this.totalElapsedLabelDiv.innerHTML = 'Total Time Elapsed';

        this.totalElapsedDiv = document.createElement('div');
        this.totalElapsedDiv.className = 'situation_counter_value';

        this.totalElapsedHolderDiv = document.createElement('div');
        this.totalElapsedHolderDiv.appendChild(this.totalElapsedLabelDiv);
        this.totalElapsedHolderDiv.appendChild(this.totalElapsedDiv);
        this.totalElapsedHolderDiv.className = 'situation_counter_holder';

        this.percentLabelDiv = document.createElement('div');
        this.percentLabelDiv.className = 'situation_counter_label';
        this.percentLabelDiv.innerHTML = 'Completed';

        this.percentDiv = document.createElement('div');
        this.percentDiv.className = 'situation_counter_value';

        this.percentHolderDiv = document.createElement('div');
        this.percentHolderDiv.appendChild(this.percentLabelDiv);
        this.percentHolderDiv.appendChild(this.percentDiv);
        this.percentHolderDiv.className = 'situation_counter_holder';

        this.counterGridDiv.appendChild(this.counterHolderDiv);
        this.counterGridDiv.appendChild(this.totalElapsedHolderDiv);
        this.counterGridDiv.appendChild(this.percentHolderDiv);

        this.nextActivityDiv = document.createElement('div');
        this.nextActivityDiv.id = 'nextActivityDiv';
        this.nextActivityDiv.innerHTML = '&nbsp;';

        this.situationDiv.appendChild(this.nameDiv);
        this.situationDiv.appendChild(this.counterGridDiv);
        this.situationDiv.appendChild(this.nextActivityDiv);

        this.updateCounters = function(counters){
            this.counterDiv.innerHTML = counters.timeRemainingInInterval;
            this.totalElapsedDiv.innerHTML = counters.elapsedTime;
            this.percentDiv.innerHTML = counters.percentComplete + "%";
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

        var progressButton = document.createElement('button');
        progressButton.id = 'progressButton';
        progressButton.name = 'progress';
        progressButton.value = 'progress';
        progressButton.innerHTML = 'Start';
        progressButton.type = 'button';
        progressButton.className = 'big';
        progressButton.onclick = function(){ progress.toggle();  }

        let rewindButton = document.createElement('button');
        rewindButton.id = 'rewindButton';
        rewindButton.innerHTML = 'Rewind';
        rewindButton.className = 'big';
        rewindButton.onclick = rewind;

        let controlDiv = document.createElement('div');
        controlDiv.id = 'controlDiv';
        controlDiv.appendChild(progressButton);
        controlDiv.appendChild(rewindButton);

        this.situationPanel = new SituationPanel();
        
        let actDiv = document.createElement('div');
        actDiv.id = 'actDiv';
        actDiv.appendChild(this.situationPanel.situationDiv);
        actDiv.appendChild(controlDiv);

        this.gridDiv = document.createElement('div');
        this.gridDiv.className = 'topGrid';
        this.gridDiv.appendChild(leftColumnDiv);
        this.gridDiv.appendChild(actDiv);

        this.setActivityNames = function(currentActivity, nextActivity){
            this.situationPanel.nameDiv.innerHTML = currentActivity;
            this.situationPanel.nextActivityDiv.innerHTML = nextActivity;
        };

        this.updateCounters = function(counters){
            this.statsPanel.updateCounters(counters);
            this.situationPanel.updateCounters(counters);
        }
    }

    function FormScreenTopNavControls(){
        let returnButton = document.createElement('button');
        returnButton.id = 'returnButton';
        returnButton.innerHTML = 'Return';
        returnButton.onclick = function(){ renderTimerScreen(); }
        
        this.controls = document.createElement('span');
        this.controls.appendChild(returnButton);
    }

    function FormScreen(workout){
        
        console.log("new form screen for " + workout);

        // name of workout
        let nameLabel = document.createElement('label');
        nameLabel.innerHTML = 'Name';
        nameLabel.className = 'new_form';
        nameLabel['for'] = 'nameInput';
        let nameInput = document.createElement('input');
        nameInput.id = 'nameInput';
        nameInput.className = 'new_form';
        nameInput.value = workout ? workout.name : '';
        let nameDiv = document.createElement('div');
        nameDiv.appendChild(nameLabel);
        nameDiv.appendChild(nameInput);

        let selectedRestTime = workout ? 
            workout.activities[0].time/1000 : 10;
        console.log("Selected rest time " + selectedRestTime);

        // rest time
        let restTimeLabel = document.createElement('label');
        restTimeLabel.innerHTML = 'Rest Time';
        restTimeLabel['for'] = 'restTimeInput';
        restTimeLabel.className = 'new_form';
        let restTimeInput = document.createElement('select');
        restTimeInput.id = 'restTimeInput';
        let restTimeValues = [ 5, 10, 15, 20 ];
        for( var idx = 0; idx<restTimeValues.length; idx++ ){
            var option = document.createElement('option');
            option.value = restTimeValues[idx];
            option.innerHTML = restTimeValues[idx];
            restTimeInput.appendChild(option);
            if( restTimeValues[idx] == selectedRestTime ){
                option.selected = 'selected';
            }
        }
        let restTimeDiv = document.createElement('div');
        restTimeDiv.appendChild(restTimeLabel);
        restTimeDiv.appendChild(restTimeInput);

        var intervalCount = 0;
        var intervals = [];
    
        let intervalTimeValues = [ 5, 10, 15, 20, 25, 30, 35, 40, 45, 
                                   50, 55, 60, 65, 70, 75, 80, 85, 90 ];
    
        function Interval(count, name, time){
            this.count = count;

            // interval 
            let intervalHeadingSpan = document.createElement('span');
            intervalHeadingSpan.innerHTML = 'Interval.&nbsp;';

            let intervalNameLabel = document.createElement('label');
            intervalNameLabel.innerHTML = 'Name';
            intervalNameLabel['for'] = 'intervalNameInput' + count;
            let intervalNameInput = document.createElement('input');
            intervalNameInput.id = 'intervalNameInput' + count;
            if (name) {
                intervalNameInput.value = name;
            }
            let intervalNameSpan = document.createElement('span');
            intervalNameSpan.appendChild(intervalNameLabel);
            intervalNameSpan.appendChild(intervalNameInput);

            let intervalTimeLabel = document.createElement('label');
            intervalTimeLabel.innerHTML = 'Time';
            intervalTimeLabel['for'] = 'intervalTimeInput' + count;
            let intervalTimeInput = document.createElement('select');
            intervalTimeInput.id = 'intervalTimeInput' + count;
            let selectedIntervalTime = time ? time/1000 : 30;
            for( var idx = 0; idx<intervalTimeValues.length; idx++ ){
                var option = document.createElement('option');
                option.value = intervalTimeValues[idx];
                option.innerHTML = intervalTimeValues[idx];
                intervalTimeInput.appendChild(option);
                if( intervalTimeValues[idx] == selectedIntervalTime ){
                    option.selected = 'selected';
                }
            }

            let intervalTimeSpan = document.createElement('span');
            intervalTimeSpan.appendChild(intervalTimeLabel);
            intervalTimeSpan.appendChild(intervalTimeInput);

            let containerDiv = document.createElement('div');
            containerDiv.className = 'form_interval_container';
            containerDiv.appendChild(intervalHeadingSpan);
            containerDiv.appendChild(intervalNameSpan);
            containerDiv.appendChild(intervalTimeSpan);
        
            let intervalDiv = document.createElement('div');
            intervalDiv.className = 'form_interval';
            intervalDiv.appendChild(containerDiv);

            this.intervalDiv = intervalDiv;
            this.nameInput = intervalNameInput;
            this.timeInput = intervalTimeInput;
        }    

        let intervalsDiv = document.createElement('div');
        if ( workout ) {
            for ( var idx = 0; idx<workout.activities.length; idx++ ){
                let activity = workout.activities[idx];
                if ( ! activity.isRest ){
                    let nextInterval = new Interval(intervalCount,
                        activity.name, activity.time);
                    intervalsDiv.appendChild(nextInterval.intervalDiv);
                    intervalCount++;
                    intervals.push(nextInterval);
                }
            }
        } else {
            let firstInterval = new Interval(intervalCount);
            intervals.push(firstInterval);
            intervalsDiv.appendChild(firstInterval.intervalDiv);
        }

        // more intervals
        let moreButton = document.createElement('button');
        moreButton.innerHTML = 'Add Interval';
        moreButton.onclick = function() {
            console.log("more intervals!"); 
            intervalCount++;
            var anotherInterval = new Interval(intervalCount);
            intervals.push(anotherInterval);
            intervalsDiv.appendChild(anotherInterval.intervalDiv);
        }
        let moreDiv = document.createElement('div');
        moreDiv.appendChild(moreButton);

        // save
        let saveButton = document.createElement('button');
        saveButton.innerHTML = 'Save';    
        saveButton.onclick = function(){ 
            let workoutSubmission = {};
            workoutSubmission.name = nameInput.value;
            workoutSubmission.activities = 
                intervals.flatMap(function (interval) 
                    { 
                        let i = {};
                        i.time = interval.timeInput.value;
                        i.name = interval.nameInput.value;
                        i.isRest = false;
                        let r = {};
                        r.name = 'Rest';
                        r.time = restTimeInput.value;
                        r.isRest = true;
                        return [ r, i ]
                    });
    
            if( workout ) {
                workoutSubmission.oldName = workout.name
            }
            let workoutJson = JSON.stringify(workoutSubmission);
            console.log('saving: ' + workoutJson);

            let requester = new XMLHttpRequest();
            // FIXME: Something needed here. - Should check the
            // results of the save
            requester.addEventListener("load", renderTimerScreen);
            requester.open("POST", "/sevenex/workouts/save");
            requester.send(workoutJson);
        };
        let saveDiv = document.createElement('div');
        saveDiv.appendChild(saveButton);
    
        let formPanelDiv = document.createElement('div');
        formPanelDiv.appendChild(nameDiv);
        formPanelDiv.appendChild(restTimeDiv);
        formPanelDiv.appendChild(intervalsDiv);
        formPanelDiv.appendChild(moreDiv);
        formPanelDiv.appendChild(document.createElement('br'));
        formPanelDiv.appendChild(saveDiv);

        // overall div
        this.formScreenDiv = document.createElement('div');
        this.formScreenDiv.appendChild(formPanelDiv);
    }   

    function MainScreenTopNavButtons(){
        let selectWorkoutSelector = document.createElement('select');
        selectWorkoutSelector.id = 'selectWorkoutSelector';
        selectWorkoutSelector.addEventListener('change', selectWorkoutCallback);
        
        let editWorkoutButton = document.createElement('button');
        editWorkoutButton.id = 'editWorkoutButton';
        editWorkoutButton.innerHTML = 'Edit';
        editWorkoutButton.onclick = 
            function () {
                renderFormScreen(program);
            };

        let newWorkoutButton = document.createElement('button');
        newWorkoutButton.id = 'newWorkoutButton';
        newWorkoutButton.innerHTML = 'New';
        newWorkoutButton.onclick =
            function () {
                renderFormScreen(null);
            }

        this.controls = document.createElement('span');
        this.controls.appendChild(selectWorkoutSelector);
        this.controls.appendChild(editWorkoutButton);
        this.controls.appendChild(newWorkoutButton);
   }

    var drawScreen = function(){
        console.log("Sevenex initializing");

        let topTitleSpan = document.createElement('span');
        topTitleSpan.id = 'topTitle';
        topTitleSpan.innerHTML = 
            "<b>Sevenex.</b> An application for quick interval workouts.";
        
        topNavControlsSpan = document.createElement('span');
        topNavControlsSpan.className = 'top_nav_controls';
        
        let topNavButtons = new MainScreenTopNavButtons();
        topNavControlsSpan.appendChild(topNavButtons.controls);

        let topDiv = document.createElement('div');
        topDiv.appendChild(topTitleSpan);
        topDiv.appendChild(topNavControlsSpan);    
    
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

                progress.index++;
                console.log("Advanced index to " + progress.index);

                let priorActivity = program.priorNonRestActivity(progress.index);
                var activity = program.activities[progress.index];
                var nextActivity = program.nextNonRestActivity(progress.index);
                var activityName;
                if ( activity == null ){
                    progress.running = false;     
                    activityName = 'Done';
                    timerScreen.stagesPanel.complete();
                } else {
                    activityName = activity.name;
                    if ( activity.isRest ){
                        timerScreen.stagesPanel.advance();
                    } 
                    progress.timeRemainingUntilNext = activity.time;
                }
                
                var nextActivityName = nextActivity ?
                    'Next:&nbsp;' + nextActivity.name : '&nbsp;';

                timerScreen.setActivityNames(activityName,nextActivityName);
            }
        
            let counters = new Counters(progress, program);
            timerScreen.updateCounters(counters);

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

    var rewind = function(){
        let rewoundActivity = program.activities[progress.index];

        let priorIndex = program.priorNonRestIndex(progress.index);
        console.log("Resetting " + progress.index + " to " + priorIndex);
        progress.index = priorIndex;

        let currentActivity = program.activities[progress.index];
        let nextActivity = program.nextNonRestActivity(progress.index);
        progress.recalculateTotalTimeElapsed(program);
        progress.timeRemainingUntilNext = currentActivity.time;

        timerScreen.setActivityNames(currentActivity.name, nextActivity.name);
        let counters = new Counters( progress, program );
        timerScreen.updateCounters( counters );
        timerScreen.stagesPanel.rewind();
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

    var renderFormScreen = function(workout) {
        contentDiv.innerHTML = '';
        topNavControlsSpan.innerHTML = '';
        let formScreen = new FormScreen(workout);
        contentDiv.appendChild(formScreen.formScreenDiv);
        let formScreenTopNavControls = new FormScreenTopNavControls();
        topNavControlsSpan.appendChild(formScreenTopNavControls.controls);
    }

    var renderTimerScreen = function() {
        loadRemoteWorkouts();
        contentDiv.innerHTML = ''; 
        topNavControlsSpan.innerHTML = '';
        timerScreen = new TimerScreen();
        contentDiv.appendChild(timerScreen.gridDiv);

        let topNavButtons = new MainScreenTopNavButtons();
        topNavControlsSpan.appendChild(topNavButtons.controls);

        setActiveProgram(defaultProgram);
    }

    var setActiveProgram = function(selectedProgram){
        program = selectedProgram;
        timerScreen.setActivityNames(program.activities[0].name,
            program.activities[1].name);
        timerScreen.stagesPanel.clear();
        timerScreen.stagesPanel.setStages(program.activityNames);
        progress = new Progress();
        let counters = new Counters ( progress, program );
        timerScreen.updateCounters(counters);

        var progressButton = document.getElementById('progressButton');
        progressButton.innerHTML = 'Start';

        timerLoop();
    }

    var start = function(){
        drawScreen();
        renderTimerScreen();
    }

    that.start = start;

    return that;
};
