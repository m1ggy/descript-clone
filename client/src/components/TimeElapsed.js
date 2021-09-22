import React, { useState, useEffect } from 'react';

function TimeElapsed({ start, stop }) {
  const [currentTime, setCurrentTime] = useState({
    hours: '0',
    minutes: '0',
    seconds: '0',
  });
  useEffect(() => {
    let timer = setTimeout(() => {
      var t = Date.parse(new Date()) - Date.parse(start);
      if (stop) {
        clearInterval(timer);
      }
      var seconds = Math.floor((t / 1000) % 60);
      var minutes = Math.floor((t / 1000 / 60) % 60);
      var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
      var days = Math.floor(t / (1000 * 60 * 60 * 24));

      setCurrentTime({ seconds, minutes, hours, days });
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    currentTime && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ margin: '10px' }}>
          <h1>{currentTime.hours}:</h1>
          <small>h</small>
        </div>
        <div style={{ margin: '10px' }}>
          <h1>{currentTime.minutes}:</h1>
          <small>m</small>
        </div>
        <div style={{ margin: '10px' }}>
          <h1>{currentTime.seconds}</h1>
          <small>s</small>
        </div>
      </div>
    )
  );
}

export default TimeElapsed;
