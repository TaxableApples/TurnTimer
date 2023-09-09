on('ready', ()=>{
  var state = state || {};
  state.timer = state.timer || {};

  var timer_x = 101,
  timer_y = 101,
  fontSize = 150,
  TurnTimeLimit = 45,
  TimerFont = 'Crimson Text',
  TimerLayer = 'gmlayer'

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
          var tokenLeft = token.get('left');
          var tokenTop = token.get('top');
          var timerText = createObj('text', {
            pageid: Campaign().get('playerpageid'),
            layer: TimerLayer,
            font_family: TimerFont,
            top: tokenTop-100,
            left: tokenLeft-100,
            width: timer_x,
            height: timer_y,
            text: TurnTimeLimit.toString(),
            font_size: fontSize,
            color: '#FF0000',
          });
          
          state.timer[activePlayerId] = {
            textObjId: timerText.get('_id'),
            time: TurnTimeLimit
          };

          var startTime = new Date().getTime();

          updateTimer(activePlayerId, startTime);
        }
      }
    }
  }

  function updateTimer(activePlayerId, startTime) {
    var currentTime = Date.now();
    var elapsedTime = (startTime - currentTime) / 1000;
    var turnRemaining = Math.round(TurnTimeLimit + elapsedTime);

    try {
      if (turnRemaining >= 0) {
        var timerTextObj = getObj('text', state.timer[activePlayerId].textObjId);
        if (timerTextObj) {
          timerTextObj.set('text', state.timer[activePlayerId].time.toString());
        }
        
        state.timer[activePlayerId].time = turnRemaining;
        setTimeout(function() {
          updateTimer(activePlayerId, startTime);
        }, 1000);
      } else {
        var timerTextObj = getObj('text', state.timer[activePlayerId].textObjId);
        if (timerTextObj) {
          timerTextObj.remove();
        }
      }

    } catch (error) {
      log("error updating TurnTimer!")
      log(error)
    }
  }

  function removeOldTimer(){
    var oldtimer = findObjs({
      _type: 'text',
      _pageid: Campaign().get("playerpageid"),
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
    if (msg.type === 'api' && msg.content.indexOf('!eot') === 0 || msg.type === 'api' && msg.content.indexOf('!pot') === 0) {
      removeOldTimer();
      createNewTimer();
    }
  });
});