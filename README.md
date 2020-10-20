# sevenex
Timer for [NYTimes Seven Minute Workout](https://www.nytimes.com/guides/well/activity/the-7-minute-workout)

# TODO

 * Server side to save workouts
 * Form to create new workouts
 * Form to edit workouts (maybe or copy)
 * Five second countdown before start
 * Detect end of workout
 * Indicate complete/active/upcoming in side panel
 * Clean up excess randomize buttons
 * Clear activity pane on workout reload
 * Make default work without server try/catch?
 * Rewind button (to beginning of last exercise)

# And 

I do not get Javascript. I wonder if the people who say they like 
Javascript have tried any other languages besides it and PHP?

# Hacking

If you just want to work on the client-side (which is the main thing),
you can just clone the project and open the index.html file in your
browser.

Running the server is a bit of a pain. You need to set up a web-server
to serve the html, css, and js, since otherwise CORs problems will 
stop the page loading things from the web server. My suggestion:
Don't bother.
