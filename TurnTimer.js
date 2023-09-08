var state = state || {};
state.timer = state.timer || {};

var timer_x = 100,
timer_y = 100,
fontSize = 150

function createNewTimer(){
  var turnorder = Campaign().get('turnorder');
  
  if (turnorder && turnorder !== "[]") {

    var turnorderArray = JSON.parse(turnorder);
    
    if (turnorderArray.length > 0) {

      var activePlayerId = turnorderArray[0].id;

      var token = findObjs({
        _type: 'graphic',
        _subtype: 'token',
        id: activePlayerId,
        layer: 'objects',
      })[0];

      if (token) {
        var timerText = createObj('text', {
          pageid: Campaign().get('playerpageid'),
          name: "Timer",
          layer: 'gmlayer',
          font_family: 'Tahoma',
          top: timer_y,
          left: timer_x,
          width: timer_x,
          height: timer_y,
          text: '30',
          font_size: fontSize,
          color: '#FF0000',
        });
        
        state.timer[activePlayerId] = {
          textObjId: timerText.get('_id'),
          time: 30,
          timeout: null
        };

        updateTimer(activePlayerId);
      }
    }
  }
}

function updateTimer(activePlayerId) {
  try {
    if (state.timer[activePlayerId].time >= 0) {

      var timerTextObj = getObj('text', state.timer[activePlayerId].textObjId);
      if (timerTextObj) {
        timerTextObj.set('text', state.timer[activePlayerId].time.toString());
      }
      
      state.timer[activePlayerId].time--;
      setTimeout(function() {
        updateTimer(activePlayerId);
      }, 1000);
    } else {
      var timerTextObj = getObj('text', state.timer[activePlayerId].textObjId);
      if (timerTextObj) {
        timerTextObj.remove();
      }
      clearTimeout(state.timer[activePlayerId].timeout);
      delete state.timer[activePlayerId];
    }

  } catch (error) {
    log(error)
  }
}

function removeOldTimer(){
  var oldtimer = findObjs({
    _type: 'text',
    _pageid: Campaign().get("playerpageid"), 
    top: timer_y,
    left: timer_x,
    width: timer_x,
    height: timer_y
  })[0];

  if (oldtimer){oldtimer.remove()}
}

on('change:campaign:turnorder', function() {
  removeOldTimer();
  createNewTimer();
});

on('chat:message', function(msg) {
  if (msg.type === 'api' && msg.content.indexOf('!eot') === 0) {
    removeOldTimer();
    createNewTimer();
  }
});