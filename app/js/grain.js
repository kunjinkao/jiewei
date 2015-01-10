function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

Array.prototype.choose = function () {
    return this[Math.floor(Math.random() * this.length)]
}

window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext;
var context = new AudioContext();

var buffer; //global variables for sample files

//master gain node
var master = context.createGain();
master.connect(context.destination);

//global varuables
var w,h;
var data;
var drawingdata = []; //an array that keeps the data
var voices = []; //an array for touch events - polyphonic
var voicesmono = []; //this will be used for mouse events - monophonic
var isloaded = false;
var X = 0;
var Y = 0;
var mouseState = false;
var helpvisible = true;
var isPlaying = false;

//control initial settings
var attack = 0.40;
var release = 0.40;
var density = 0.85;
var spread = 0.2;
var reverb = 0.5;
var pan = 0.1;
var trans = 1;
var pos = 0.5;
var amp = 1;

//the grain class
function grain(p, buffer,positionx,positiony,attack,release,spread,pan){

	var that = this; //for scope issues
	this.now = context.currentTime; //update the time value
	//create the source
	this.source = context.createBufferSource();
	this.source.playbackRate.value = this.source.playbackRate.value * trans;
	this.source.buffer = buffer;
	//create the gain for enveloping
	this.gain = context.createGain();
	
	//experimenting with adding a panner node - not all the grains will be panned for better performance
	var yes = parseInt(Math.random()*3,10);

	if( yes === 1){
		this.panner = context.createPanner();
		this.panner.panningModel = "equalpower";
		this.panner.distanceModel = "linear";
		this.panner.setPosition(getRandom(pan * -1, pan), 0, 0);
		//connections
		this.source.connect(this.panner);
		this.panner.connect(this.gain);
	}else{
		this.source.connect(this.gain);
	}
	
	
	this.gain.connect(master);
	
	//update the position and calcuate the offset
	this.positionx = positionx;
	this.offset = this.positionx * (buffer.duration); //pixels to seconds
	
	//update and calculate the amplitude
	this.positiony = positiony;
	this.amp = this.positiony;
	this.amp = Math.map(this.amp, 0.0, 1.0, 0.0, 1.0) * 0.7;
	
	//parameters
	this.attack = attack * 0.4;
	this.release = release * 1.5;
	
	if(this.release < 0){
		this.release = 0.1; // 0 - release causes mute for some reason
	}
	this.spread = spread;

	this.randomoffset = (Math.random() * this.spread) - (this.spread / 2); //in seconds
	///envelope
	this.source.start(this.now,this.offset + this.randomoffset,this.attack + this.release); //parameters (when,offset,duration)
	this.gain.gain.setValueAtTime(0.0, this.now);
	this.gain.gain.linearRampToValueAtTime(this.amp,this.now + this.attack);
	this.gain.gain.linearRampToValueAtTime(0,this.now + (this.attack +  this.release) );
	
	//garbage collection
	this.source.stop(this.now + this.attack + this.release + 0.1); 
	var tms = (this.attack + this.release) * 1000; //calculate the time in miliseconds
	setTimeout(function(){
		that.gain.disconnect();
		if(yes === 1){
			that.panner.disconnect();
		}
	},tms + 200);

	//drawing the lines
  // p.stroke(p.random(125) + 125,p.random(250),p.random(250)); //,(this.amp + 0.8) * 255
	//p.strokeWeight(this.amp * 5);
  // this.randomoffsetinpixels = this.randomoffset / (buffer.duration / w);
	//p.background();
  // p.line(this.positionx + this.randomoffsetinpixels,0,this.positionx + this.randomoffsetinpixels,p.height);
  // setTimeout(function(){
  //   p.background();
  //   p.line(that.positionx + that.randomoffsetinpixels,0,that.positionx + that.randomoffsetinpixels,p.height);
  // },200);
}



// var request = new XMLHttpRequest();
//   request.open('GET','audio/example.wav',true);
//   request.responseType = "arraybuffer";
//   request.onload = function(){
//     context.decodeAudioData(request.response, function(b){
//       buffer = b; //set the buffer
//       data = buffer.getChannelData(0);
//       isloaded = true;
//     },function(){
//       console.log('loading failed')
//     });
//   };
// request.send();

var loadSample  = function(filename){
  var request = new XMLHttpRequest();
  var filepath = 'audio/' + filename;
	request.open('GET', filepath, true);
	request.responseType = "arraybuffer";
	request.onload = function(){
		context.decodeAudioData(request.response, function(b){
			buffer = b; //set the buffer
			data = buffer.getChannelData(0);
			isloaded = true;
		},function(){
			console.log('loading failed')
		});
	};
  request.send();
}

var playGrain = function(){
  // this.positiony = positiony;
  // this.pos = pos;
  // this.amp = amp;
  if(isPlaying) {
    return;
  }

  if(!isloaded) {
    return;
  }

  isPlaying = true;
  $("#desc").hide();

	this.grains = [];
	this.graincount = 0;

	var that = this; //for scope issues	
	this.play = function(){
    
    var testGlitch = parseInt(Math.random()*100, 10);

    if(testGlitch===1) {
      $('glitch-img').attr({
        "seed": getRandom(0, 99),
        "amount": getRandom(0, 50),
        "quality": getRandom(0, 99)
      });
    }

    //create new grain
    p = {}
    var g = new grain(p, buffer, pos, amp, attack, release, spread, pan);

    //push to the array
    that.grains[that.graincount] = g;
    that.graincount += 1;

    if(that.graincount > 30){
      that.graincount = 0;
    }
		//next interval
		this.dens = Math.map(density, 1, 0, 0, 1);
		this.interval = (this.dens * 500) + 70;
		that.timeout = setTimeout(that.play, this.interval);
	}
	this.play();
}

var stopGrain = function() {
  clearTimeout(this.timeout);
}

var samples = [
  'shakecoin.wav',
  'beatloop.wav',
  'slowdown.wav',
  'train.wav',
  'fireworks.wav', 
  'treefall.wav',
  'water-pouring.wav',
  'water-sink.wav',
  'whistle.wav',
  'coinfall.wav',
  'glitch.wav'
  ];

loadSample(samples.choose());