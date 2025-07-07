(function () {
  if (typeof WebSocket === 'undefined' || typeof RoomState === 'undefined') {
    return;
  }

  const ws = new WebSocket('ws://localhost:3000');
  let applyingRemote = false;

  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ type: 'state', state: RoomState.getState() }));
  });

  ws.addEventListener('message', (ev) => {
    let data;
    try {
      data = JSON.parse(ev.data);
    } catch (err) {
      return;
    }
    if (data.type === 'state') {
      applyingRemote = true;
      RoomState.replaceState(data.state || {});
      applyingRemote = false;
    }
  });

  RoomState.subscribe(() => {
    if (ws.readyState === WebSocket.OPEN && !applyingRemote) {
      ws.send(JSON.stringify({ type: 'state', state: RoomState.getState() }));
    }
  });
})();
