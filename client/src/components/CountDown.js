import React, { useState } from 'react';

function CountDown() {
  const [seconds, setSeconds] = useState(3);

  setTimeout(() => {
    if (seconds <= 0) return;
    setSeconds(seconds - 1);
  }, 1000);

  return <div>{seconds}</div>;
}

export default CountDown;
