(function () {
	var lastTime = 0;
	var vendors = ["ms", "moz", "webkit", "o"];
	for (
	  var x = 0;
	  x < vendors.length && !window.requestAnimationFrame;
	  ++x
	) {
	  window.requestAnimationFrame =
		window[vendors[x] + "RequestAnimationFrame"];
	  window.cancelRequestAnimationFrame =
		window[vendors[x] + "CancelRequestAnimationFrame"];
	}

	if (!window.requestAnimationFrame)
	  window.requestAnimationFrame = function (callback, element) {
		var currTime = new Date().getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function () {
		  callback(currTime + timeToCall);
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame)
	  window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
})();

var v = document.createElement("div");
v.id = 'viewport';
var w = document.createElement("div");
w.id = 'world';
v.append(w);
var sa = document.createElement('div');
sa.id = 'stararea';
sa.className = 'paused';

for(var i=-1;i<=6;i++){
	var s = document.createElement("div");
	if (i == -1){
		s.id = 'comet1';
	} else if (i == 0){
		s.id = 'comet2';
	} else {
		s.id = 'stars' + i;
	}
	sa.append(s);
}

var sol = document.createElement('ol');
for(var i=1;i<=10;i++){
	var s = document.createElement("li");
	sol.append(s);
}
sa.append(sol);
var cd1 = document.createElement('div');
cd1.className = 'countdown';

var lc = document.createElement('div');
lc.className = 'lifecount';
cd1.append(lc);

var lcd = document.createElement('div');
lcd.id = 'life_countdown';
cd1.append(lcd);

//var ssvg = document.createElement('svg');
//var scir = document.createElement('circle');
//scir.setAttribute('r', 18);
//scir.setAttribute('cx', 20);
//scir.setAttribute('cy', 20);
//ssvg.append(scir);
//cd1.append(ssvg);

cd1.insertAdjacentHTML( 'beforeend', '<svg><circle r="18" cx="20", cy="20"></circle></svg>' );
sa.append(cd1);


var ra = document.createElement('div');
ra.id = 'rocketarea';
ra.className = 'paused';

var cd2 = document.createElement('div');
cd2.className = 'countdown';

var fc = document.createElement('div');
fc.className = 'lifecount';
cd2.append(fc);

var fcd = document.createElement('div');
fcd.id = 'rocket_countdown';
cd2.append(fcd);

//var ssvg2 = document.createElement('svg');
//var scir2 = document.createElement('circle');
//scir2.setAttribute('r', 18);
//scir2.setAttribute('cx', 20);
//scir2.setAttribute('cy', 20);
//ssvg2.append(scir2);
//cd2.append(ssvg2);

cd2.insertAdjacentHTML( 'beforeend', '<svg><circle r="18" cx="20", cy="20"></circle></svg>' );
ra.append(cd2);

v.append(sa);
v.append(ra);

document.body.insertBefore(v, document.body.firstChild);

var layers = [],
	objects = [],
	textures = [],
	world = document.getElementById("world"),
	viewport = document.getElementById("viewport"),
	d = -220,
	p = 400,
	worldXAngle = 0,
	worldYAngle = 0,
	computedWeights = [],
	isInit = false;

  viewport.style.webkitPerspective = p;
  viewport.style.MozPerspective = p + "px";
  viewport.style.oPerspective = p;
  viewport.style.perspective = p;

  textures = [
	{ name: "white cloud", file: "cloud.png", classname: 'cloud', opacity: 1, weight: 100 },
	{ name: "dark cloud", file: "darkCloud.png", classname: 'darkcloud', opacity: 1, weight: 100 }
  ];
function initCloud()
{
	if(isInit == false){
		window.addEventListener("mousewheel", onContainerMouseWheel);
		window.addEventListener("DOMMouseScroll", onContainerMouseWheel);
		window.addEventListener("mousemove", onCloudMouseOver);
		window.addEventListener("touchmove", onCloudTouchMove);
		isInit = true;
	}
}
function onCloudMouseOver(e){
		worldYAngle = -(0.5 - e.clientX / window.innerWidth) * 180;
		worldXAngle = (0.5 - e.clientY / window.innerHeight) * 180;
		updateView();
}
function onCloudTouchMove(e){
	var ptr = e.changedTouches.length;
	while (ptr--) {
	var touch = e.changedTouches[ptr];
	worldYAngle = -(0.5 - touch.pageX / window.innerWidth) * 180;
	worldXAngle = (0.5 - touch.pageY / window.innerHeight) * 180;
	updateView();
	}
	e.preventDefault();
}
function destory(){
	//window.cancelAnimationFrame(cloudid);
	
	window.removeEventListener("mousewheel", onContainerMouseWheel);
	window.removeEventListener("DOMMouseScroll", onContainerMouseWheel);
	window.removeEventListener("mousemove", onCloudMouseOver);
	window.removeEventListener("touchmove", onCloudTouchMove);
	isInit = false;
	clearCloud(function(){
		viewport.style.transform = null;
		world.style.transform = null;
	});		
}
function createCloud() {
	var div = document.createElement("div");
	div.className = "cloudBase";
	var x = 256 - Math.random() * 512;
	var y = 256 - Math.random() * 512;
	var z = 256 - Math.random() * 512;
	var t =
	  "translateX( " +
	  x +
	  "px ) translateY( " +
	  y +
	  "px ) translateZ( " +
	  z +
	  "px )";
	div.style.webkitTransform = div.style.MozTransform = div.style.oTransform = div.style.transform = t;
	world.appendChild(div);

	for (var j = 0; j < 5 + Math.round(Math.random() * 10); j++) {
	var cloud = document.createElement("div");
	  cloud.style.opacity = 0;
	  var r = Math.random();
	  var classname = "cloud";
	  for (var k = 0; k < computedWeights.length; k++) {
		if (r >= computedWeights[k].min && r <= computedWeights[k].max) {
		  classname = computedWeights[k].classname;
		}
	  }

	  cloud.className = "cloudLayer " + classname;
	  
	  var x = 256 - Math.random() * 512;
	  var y = 256 - Math.random() * 512;
	  var z = 100 - Math.random() * 200;
	  var a = Math.random() * 360;
	  var s = 0.25 + Math.random();
	  x *= 0.2;
	  y *= 0.2;
	  cloud.data = {
		x: x,
		y: y,
		z: z,
		a: a,
		s: s,
		speed: 0.1 * Math.random(),
	  };
	  var t =
		"translateX( " +
		x +
		"px ) translateY( " +
		y +
		"px ) translateZ( " +
		z +
		"px ) rotateZ( " +
		a +
		"deg ) scale( " +
		s +
		" )";
	  cloud.style.webkitTransform = cloud.style.MozTransform = cloud.style.oTransform = cloud.style.transform = t;

	  div.appendChild(cloud);
	  layers.push(cloud);
	}
	
	$(world).find('.cloud').each(function(i, e){
		$(this).delay(i * 2.5).animate({'opacity': 1}, 100);
	})

	return div;
}

function clearCloud(callback){
	objects = [];
	var cloudcount = $(world).find('.cloud').length - 1;
	$(world).find('.cloud').each(function(i, e){
		$(this).delay(i * 2.5).animate({'opacity': 0}, 100, function(){
			$(this).parent().remove();
			if (i == cloudcount){
				if (typeof (callback) == 'function'){
					callback();
				}
			}
		});
	})
	
	if (cloudcount == -1){
		if (typeof (callback) == 'function'){
			callback();
		}
	}
}
function generate() {
	
	clearCloud(function(){
		computedWeights = [];
		var total = 0;
		for (var j = 0; j < textures.length; j++) {
		  if (textures[j].weight > 0) {
			total += textures[j].weight;
		  }
		}
		var accum = 0;
		for (var j = 0; j < textures.length; j++) {
		  if (textures[j].weight > 0) {
			var w = textures[j].weight / total;
			computedWeights.push({
			  src: textures[j].file,
			  min: accum,
			  max: accum + w,
			  classname: textures[j].classname,
			});
			accum += w;
		  }
		}
		
		for (var j = 0; j < 15; j++) {
		  objects.push(createCloud());
		}
	});
	
}

function updateView() {
	var t =
	  "translateZ( " +
	  d +
	  "px ) rotateX( " +
	  worldXAngle +
	  "deg) rotateY( " +
	  worldYAngle +
	  "deg)";
	world.style.webkitTransform = world.style.MozTransform = world.style.oTransform = world.style.transform = t;
}

function onContainerMouseWheel(event) {
	event = event ? event : window.event;
	d = d - (event.detail ? event.detail * -5 : event.wheelDelta / 8);
	updateView();
}

function orientationhandler(e) {
	if (!e.gamma && !e.beta) {
	  e.gamma = -(e.x * (180 / Math.PI));
	  e.beta = -(e.y * (180 / Math.PI));
	}

	var x = e.gamma;
	var y = e.beta;

	worldXAngle = y;
	worldYAngle = x;
	updateView();
}

function update() {
	for (var j = 0; j < layers.length; j++) {
	  var layer = layers[j];
	  layer.data.a += layer.data.speed;
	  var t =
		"translateX( " +
		layer.data.x +
		"px ) translateY( " +
		layer.data.y +
		"px ) translateZ( " +
		layer.data.z +
		"px ) rotateY( " +
		-worldYAngle +
		"deg ) rotateX( " +
		-worldXAngle +
		"deg ) rotateZ( " +
		layer.data.a +
		"deg ) scale( " +
		layer.data.s +
		")";
	  layer.style.webkitTransform = layer.style.MozTransform = layer.style.oTransform = layer.style.transform = t;
	}

	if (isInit){
		requestAnimationFrame(update);
	}
}

/*rocket*/
var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
mousePos = {
  x: 400,
  y: 300 },
// create canvas
canvas = document.createElement('canvas'),
context = canvas.getContext('2d'),
particles = [],
rockets = [],
MAX_PARTICLES = 400,
colorCode = 0;
var rockettimer1;
var rockettimer2;
var startrocket = false;
// init
$(document).ready(function () {
	viewport = document.getElementById("viewport")
	viewport.append(canvas);
  //document.body.appendChild(canvas);
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
});

// update mouse position
$(document).mousemove(function (e) {
  e.preventDefault();
  mousePos = {
    x: e.clientX,
    y: e.clientY };
});

// launch more rockets!!!
$(document).mousedown(function (e) {
	if (startrocket){
		launchFrom(mousePos.x);
	}
});

function launch() {
  for (var i = 0; i < Math.floor(Math.random() * 10) + 1; i++) {
    launchFrom(Math.random() * SCREEN_WIDTH * 2 / 3 + SCREEN_WIDTH / 6);
  }
}

function launchFrom(x) {

  if (rockets.length < 10) {
    var rocket = new Rocket(x);
    rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
    rocket.vel.y = Math.random() * -3 - 4;
    rocket.vel.x = Math.random() * 6 - 3;
    rocket.size = 8;
    rocket.shrink = 0.999;
    rocket.gravity = 0.01;
    rockets.push(rocket);
  }
}

function loop() {
  // update screen size
  if (SCREEN_WIDTH != window.innerWidth) {
    canvas.width = SCREEN_WIDTH = window.innerWidth;
  }
  if (SCREEN_HEIGHT != window.innerHeight) {
    canvas.height = SCREEN_HEIGHT = window.innerHeight;
  }

  // clear canvas
  context.fillStyle = $('body').css('background-color');//"rgba(25, 42, 54, 1)";
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  var existingRockets = [];

  for (var i = 0; i < rockets.length; i++) {
    // update and render
    rockets[i].update();
    rockets[i].render(context);

    // calculate distance with Pythagoras
    var distance = Math.sqrt(Math.pow(mousePos.x - rockets[i].pos.x, 2) + Math.pow(mousePos.y - rockets[i].pos.y, 2));

    // random chance of 1% if rockets is above the middle
    var randomChance = rockets[i].pos.y < SCREEN_HEIGHT * 2 / 3 ? Math.random() * 100 <= 1 : false;

    /* Explosion rules
     - 80% of screen
     - going down
     - close to the mouse
     - 1% chance of random explosion
     */
    if (rockets[i].pos.y < SCREEN_HEIGHT / 5 || rockets[i].vel.y >= 0 || distance < 50 || randomChance) {
      rockets[i].explode();
    } else {
      existingRockets.push(rockets[i]);
    }
  }

  rockets = existingRockets;

  var existingParticles = [];

  for (var i = 0; i < particles.length; i++) {
    particles[i].update();

    // render and save particles that can be rendered
    if (particles[i].exists()) {
      particles[i].render(context);
      existingParticles.push(particles[i]);
    }
  }

  // update array with existing particles - old particles should be garbage collected
  particles = existingParticles;

  while (particles.length > MAX_PARTICLES) {
    particles.shift();
  }
}

function Particle(pos) {
  this.pos = {
    x: pos ? pos.x : 0,
    y: pos ? pos.y : 0 };

  this.vel = {
    x: 0,
    y: 0 };

  this.shrink = .97;
  this.size = 2;

  this.resistance = 1;
  this.gravity = 0;

  this.flick = false;

  this.alpha = 1;
  this.fade = 0;
  this.color = 0;
}

Particle.prototype.update = function () {
  // apply resistance
  this.vel.x *= this.resistance;
  this.vel.y *= this.resistance;

  // gravity down
  this.vel.y += this.gravity;

  // update position based on speed
  this.pos.x += this.vel.x;
  this.pos.y += this.vel.y;

  // shrink
  this.size *= this.shrink;

  // fade out
  this.alpha -= this.fade;
};

Particle.prototype.render = function (c) {
  if (!this.exists()) {
    return;
  }

  c.save();

  c.globalCompositeOperation = 'lighter';

  var x = this.pos.x,
  y = this.pos.y,
  r = this.size / 2;

  var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
  gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
  gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
  gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

  c.fillStyle = gradient;

  c.beginPath();
  c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);

  c.closePath();
  c.fill();

  c.restore();
};

Particle.prototype.exists = function () {
  return this.alpha >= 0.1 && this.size >= 1;
};

function Rocket(x) {
  Particle.apply(this, [{
    x: x,
    y: SCREEN_HEIGHT }]);

  this.explosionColor = 0;
}

Rocket.prototype = new Particle();
Rocket.prototype.constructor = Rocket;

Rocket.prototype.explode = function () {
  var count = Math.random() * 10 + 80;

  for (var i = 0; i < count; i++) {
    var particle = new Particle(this.pos);
    var angle = Math.random() * Math.PI * 2;

    // emulate 3D effect by using cosine and put more particles in the middle
    var speed = Math.cos(Math.random() * Math.PI / 2) * 15;

    particle.vel.x = Math.cos(angle) * speed;
    particle.vel.y = Math.sin(angle) * speed;

    particle.size = 10;

    particle.gravity = 0.2;
    particle.resistance = 0.92;
    particle.shrink = Math.random() * 0.05 + 0.93;

    particle.flick = true;
    particle.color = this.explosionColor;

    particles.push(particle);
  }
};

Rocket.prototype.render = function (c) {
  if (!this.exists()) {
    return;
  }

  c.save();

  c.globalCompositeOperation = 'lighter';

  var x = this.pos.x,
  y = this.pos.y,
  r = this.size / 2;

  var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
  gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
  gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");

  c.fillStyle = gradient;

  c.beginPath();
  c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
  c.closePath();
  c.fill();

  c.restore();
};