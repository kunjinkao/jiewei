var jieweiApp = angular.module('jiewei', ['monospaced.qrcode']);


jieweiApp.controller('VideoController', function($scope, $interval) {
  var videos = ['videos/zhugeliang.mp4', 'videos/tangmu.mp4', 'videos/zuqu.mp4', 'videos/zuqu2.mp4','videos/yanyi.mp4'];
  var huesToChoose = ['yellow', 'green', 'blue', 'red', 'orange'];
  var authors = {
    'videos/zhugeliang.mp4': "懒天白",
    'videos/tangmu.mp4': "W芙兰朵露W",
    'videos/zuqu.mp4': '★开心熊猫★',
    'videos/zuqu2.mp4': '主教',
    'videos/yanyi.mp4': 'LIKEfeather'
  }

  video = document.getElementById('video');

  var updateVideo = function(play){
    $scope.video = _.sample(videos);
    $scope.author = authors[$scope.video];

    if(play) {
      video.play();
    }
  }

  updateVideo(false);


  video.addEventListener('ended', function(){
    updateVideo(true);
  });

  $(document).foundation();

  $scope.playOrPause = function(){
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  var genDanmakuObj = function(word, mode, size, color){
    return {
      "mode": mode,
      "text": word,
      "size": size,
      "color": color
    }
  }

  var genDanmakuObjRandom = function(word, size) {
    var peoples = ['Ding Chen Chen', '邓成龙', '一一', '秦岭', '裸的来', '朱松杰'];

    return {
      "mode": _.random(1, 7),
      "text": _.sample(peoples) + "演的太好了",
      "size": _.random(50, 100),
      "color": 0x000000
    }
  }

  var cm = new CommentManager(document.getElementById('my-comment-stage'));

  cm.init();
  cm.start();

  var sendDanmaku = function(word, userId){
    var hue = huesToChoose[userId%huesToChoose.length];
    var mode = _.random(1, 6);
    var size = _.random(60, 120);
    var color = parseInt(randomColor({hue:hue}).split('#')[1], 16);
    var obj = genDanmakuObj(word, mode, size, color);
    cm.send(obj);
  }


  rhizome.on('connected', function() {
    console.log('connected');
  })

  rhizome.start(function(err) {
    if (err) return alert(err)

    rhizome.send('/sys/subscribe', ['/danmaku']);
    rhizome.send('/sys/subscribe', ['/effect']);
  })

  rhizome.on('message', function(address, args) {
    if (address === '/sys/subscribed') {
      console.log('successfully subscribed to ' + args[0])
    } else if (address === '/danmaku') {
      // if(parseInt(args[1]) != rhizome.userId ) return;
      sendDanmaku(args[0], args[1]);
    } else if (address === '/effect') {
      updateEffect(args);
    }
  })

  var updateEffect = function(args) {
      // 0 loudness, 1 centroid for now
      hue.hue = args[0]*2 - 1;
      hue.saturation = args[1] * 2 - 1;
      tvglitch.distortion  = args[2];
      tvglitch.scanlines  = args[3];
      tvglitch.lineSync  = args[4];

  }


  //  seriously begin
  var seriously, colorbars, target, tvglitch, noise;
  seriously = new Seriously();
  colorbars = seriously.source('#video');
  target = seriously.target('#canvas');
  hue = seriously.effect('hue-saturation');
  tvglitch = seriously.effect('tvglitch');

  hue.hue = 0; // -1 - 1
  hue.saturation = 0; // -1 - 1
  tvglitch.distortion = 0; // 0 - 1
  tvglitch.scanlines = 0;  // 0 - 1
  tvglitch.lineSync = 0;  // 0 - 1
  hue.source = colorbars;
  tvglitch.source = hue;
  target.source = tvglitch;
  seriously.go();
  // seriously end

  // full screen canvas
  function fullscreen(){
    var elem = document.getElementById('video-section');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }

  $scope.fullScreen = function() {
    $scope.isFullScreen = true;
    fullscreen();
  }

  var win = $(window);

  function resize() {
    $("#canvas") // best to save a reference of this
      .width(win.width())
      .height(win.height() - 110);
  }

  win.resize(resize).resize();

  $scope.href = location.protocol + '//' + location.host;
});
