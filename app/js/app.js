$(function() {

  var $submitBtn = $('#submit-btn');
  var $userInput = $('#user-input-text');

  $('body').bind('copy paste', function(e){
    e.preventDefault();
    return false;
  })

  rhizome.on('connected', function() {
    console.log('connected');
  })

  rhizome.start(function(err) {
    if (err) return alert(err)

    // $(document).foundation();

    $submitBtn.on('click', function(){
      var text = $userInput.val();

      if (text) {
        rhizome.send('/danmaku', [text, rhizome.id]);
      } else {
        alert('输点什么吧');
      }
    });
  })


  rhizome.on('message', function(address, args) {
    if (address === '/sys/subscribed') {
      console.log('successfully subscribed to ' + args[0])
    } else if (address === '/update/one/single') {
      console.log('yes');
    } else if (address === '/update/all/sample') {
      console.log('yes');
    }
  })

})
