var jieweiApp = angular.module('jiewei', []);


jieweiApp.controller('VideoController', function($scope, $interval) {
  var huesToChoose = ['yellow', 'green', 'blue', 'red', 'orange'];
  var video = document.getElementById('video')

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
      hue.hue = args[0];
      hue.saturation = args[1];
  }

  //  seriously begin
  var seriously, colorbars, target, vignette;
  seriously = new Seriously();
  colorbars = seriously.source('#video');
  target = seriously.target('#canvas');
  hue = seriously.effect('hue-saturation');

  hue.source = colorbars;
  target.source = hue;
  seriously.go();
  // seriously end
});
