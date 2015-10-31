var started = false; // is the timer started
var timeCanvas = document.getElementById('time');
var viewportWidth = document.documentElement.clientWidth;
var viewportHeight = document.documentElement.clientHeight;
var canvasLength, radius, center;
var startTime, durationMiliseconds;
var clockTime = 25;
var animID;
var timeUp = false;
var alarm = new Audio('https://s3-eu-west-1.amazonaws.com/jjmax/audio/alarm.mp3');

// canvas styles
var arcWidth = 40;
var innerArcColor = "#7C4DFF";
var outerArcColor = "#03A9F4";
var fontStyle = "48px Roboto";
var fontColor = "#000000";

var canvasDimensions = function() {
  canvasLength = Math.min(viewportWidth, viewportHeight) / 1.5;
  timeCanvas.width = canvasLength;
  timeCanvas.height = canvasLength;

  radius = canvasLength / 2.5;
  center = canvasLength / 2;
};

var degToRad = function(deg) {
  return deg * (Math.PI / 180);
};

var milisecondsConvert = function(milis) {
  var minutes = Math.floor(milis / 60000);
  var seconds = milis % 60000; //in miliseconds to allow smoother animation on seconds arc
  return [minutes, seconds];
};

var drawClock = function() {

  var diff = durationMiliseconds - (Date.now() - startTime | 0);

  if (diff < 0) {
    started = false;
    diff = 0;
    timeUp = true;
    alarm.play();
  }

  var diffTime = milisecondsConvert(diff); //returns array [mins, secs]
  var diffSecondsDegrees = diffTime[1] * 6 / 1000 || 360; // 1 second = six degrees
  var diffMinutesDegrees = diff / durationMiliseconds * 360 || 360; // convert total remaining time to degrees of full circle

  if (timeCanvas.getContext) {
    // the function to draw/redraw the clock
    var ctx = timeCanvas.getContext('2d');
    ctx.save();

    // setup the context
    ctx.clearRect(0, 0, canvasLength, canvasLength);
    ctx.lineWidth = arcWidth;
    ctx.translate(center, center);
    ctx.save();
    ctx.rotate(-1.57079633); // rotate canvas -90 degrees to set 0 degress at 12 o'clock

    // draw the outer ring
    ctx.strokeStyle = outerArcColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, degToRad(diffSecondsDegrees));
    ctx.stroke();

    // draw the inner ring
    ctx.strokeStyle = innerArcColor;
    ctx.beginPath();
    ctx.arc(0, 0, radius - arcWidth, 0, degToRad(diffMinutesDegrees));
    ctx.stroke();

    // draw the numbers
    ctx.restore();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = fontStyle;
    ctx.fillStyle = fontColor;
    ctx.fillText(diffTime[0] + " : " + ("0" + Math.floor(diffTime[1] / 1000)).slice(-2), 0, 0);

    ctx.restore();
  }

  if (started === true) {
    animID = window.requestAnimationFrame(drawClock);
  }

};

var clock = function(duration) {
  // function to setup initial clock state
  // starting point - http://irae.pro.br/lab/canvas_pie_countdown/
  // timer using Date code - http://stackoverflow.com/questions/20618355/the-simplest-possible-javascript-countdown-timer
  startTime = Date.now();
  durationMiliseconds = duration * 60 * 1000;

  drawClock(); //initial clock
};

// events
document.getElementById('start-timer').addEventListener('click', function(e) {
  if (started === true) {
    started = false;
    this.innerHTML = "Start";
    window.cancelAnimationFrame(animID);
    clock(clockTime);
  } else {
    this.innerHTML = "Reset";
    started = true;
    clock(clockTime);
  }
});

document.getElementById('add-minutes').addEventListener('click', function(e) {
  clockTime += 5;
  clock(clockTime);
});

document.getElementById('remove-minutes').addEventListener('click', function(e) {
  clockTime -= 5;
  clock(clockTime);
});

// Start of MDN Resize
// from MDN - https://developer.mozilla.org/en-US/docs/Web/Events/resize
// efficient way to calculate resizes of window
;(function() {
  var throttle = function(type, name, objRec) {
    var obj = objRec || window;
    var running = false;
    var func = function() {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle("resize", "optimizedResize");
})();

// handle event
window.addEventListener("optimizedResize", function() {
  viewportWidth = document.documentElement.clientWidth;
  viewportHeight = document.documentElement.clientHeight;
  canvasDimensions();
  if (!started) {
    clock(clockTime);
  }
});
// END of MDN Resize

var init = function() {
  canvasDimensions();
  clock(clockTime);
};

init();
