var np = 300;
var startcol;
//var noiseA = random(5);
//var noiseB = random(5);
//var screenImg = get();
var white;

var socket;
//var fader;
var drawLength = 20000;
var shrink;
var array = [];
var cnv;

var colors = [];
var img;
var oldFrames;
function setup() {
  //createCanvas(700, 700);
  cnv = createCanvas(700, 700);
  centerCanvas();
  socket = io.connect('http://localhost:9999');

  socket.on('moodData', function(data) {
    console.log("Got: ", data);
    // Draw a blue circle
    var colorStrings = data.split(',');

    for (var i = 0; i < colorStrings.length; i++) {
      colors[i] = colorStrings[i];
    }
  }
  );

  background(2);
  noFill();
  noiseSeed(random(100));
  startcol = random(250);
  white = color(255, 10);
  //img = createImage();
  img = get();

  background(255);
  shrink = get();
  userRef = firebase.database().ref('/test');
  userRef.on('child_added', function(snapshot) {

    var colorStrings = snapshot.val().split(',');

    for (var i = 0; i < colorStrings.length; i++) {
      colors[i] = colorStrings[i];
    }
    //console.log(colors);
  }
  );
  frameRate(10);

}

function draw() {
  //console.log(colors);
  var newFrame = createGraphics(width, height);

  //noStroke();

  newFrame.stroke(colors[0], colors[1], colors[2]);
  newFrame.strokeWeight(1);
  newFrame.noFill(1);
  newFrame.beginShape();
  //scale(.5);

  var sx, sy;
  var points = [];
  for (var i = 0; i <= np; i++) {
    var angle = map(i, 0, np, 0, TWO_PI);
    var cx2 = frameCount*2 ;
    var cx = width / 2;
    var cy2 = height;
    var cy = height / 2;
    var xx = 100 * cos(angle + cx2 / 10);
    var yy = 100 * sin(angle + cx2 / 10);
    var v = createVector(xx, yy);
    xx = (xx + cx2) / 150;
    yy = (yy + cy2) / 150;
    v.mult(1 + 2 * noise(xx, yy));

    if (i == 0) {
      sx = cx + v.x;
      sy = cy + v.y;
    }
    newFrame.vertex(cx + v.x, cy + v.y);
    //points.push( {x: cx + v.x, y: cy + v.y});
  }


  //colorMode(HSB);
  //var hue = cx / 10 - startcol;
  //if (hue < 0) hue += 255;
  //stroke(hue, 100, 120);
  //stroke(hue, 100, 120);

  //beginShape();
  //for (var i = 0; i < array.length; i++) {
  //  if (i == 0) {
  //    sx = cx + v.x;
  //    sy = cy + v.y;
  //  } else {
  //    vertex(array[i].x, array[i].y);
  //  }
  //}

  newFrame.endShape();
  //image(newFrame, 0, 0);
  blend(img, 0, 0, width, height, 0, 0, width, height, ADD);
  shrink = get();
  //beginShape();
  //for (var i = 0; i < points.length; i++) {
  //  vertex(points[i].x, points[i].y);
  //}
  //endShape();
  //newFrame.filter(BLUR, 2);
  image(newFrame, 0, 0);
  //getSerial();
}

function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}



function windowResized() {
  centerCanvas();
}

function getSerial() {
}
