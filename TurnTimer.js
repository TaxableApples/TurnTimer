var state = state || {};
state.timer = state.timer || {};

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

on('change:campaign:turnorder', function() {

  var oldtimer = findObjs({
    _type: 'text',
    _pageid: Campaign().get("playerpageid"), 
  })[0];

  var response = JSON.stringify(oldtimer)

  log(response)
  //if (oldtimer){oldtimer.remove()}

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
          top: 70,
          left: 70,
          width: 70,
          height: 70,
          text: '30',
          font_size: 70,
          color: '#FF0000',
        });
        
        state.timer[activePlayerId] = {
          textObjId: timerText.get('_id'),
          time: 45,
          timeout: null
        };

        updateTimer(activePlayerId);
      }
    }
  }
});