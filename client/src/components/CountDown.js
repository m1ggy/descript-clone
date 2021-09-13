import React, { useState } from 'react';

function CountDown({ delay = 3 }) {
  const [seconds, setSeconds] = useState(delay);

  setTimeout(() => {
    if (seconds <= 0) return;
    setSeconds(seconds - 1);
  }, 1000);

  return <h1>{seconds}</h1>;
}

export default CountDown;
