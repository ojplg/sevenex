# sevenex

Sevenex is a javascript program for timing interval-based workouts.
Sevenex allows you to create your own workouts and save them.
(Though that code is pretty sucky. Remember our motto: patches welcome.)

[Try it out.](https://hrorm.org/sevenex/)

The inspiration was the [NYTimes Seven Minute Workout](https://www.nytimes.com/guides/well/activity/the-7-minute-workout)

# TODO

 * CRUD work
   * A way to edit workouts (maybe copy)
   * Validation of submission (web side)
   * Validation (serverside)
   * Check server response before exiting form
   * Do not overwrite repository workouts.json on server
 * Deactivate/grey-out randomize button after start
 * Check rewind works on corner cases

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

I admit, the whole thing is a gigantic mess.
