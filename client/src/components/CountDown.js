import React, { useState, useRef } from 'react';

function CountDown({ delay = 3 }) {
  const [seconds, setSeconds] = useState(delay);
  const countRef = useRef(seconds);

  countRef.current = seconds;

  setTimeout(() => {
    if (seconds <= 0) return;
    setSeconds(countRef.current - 1);
  }, 1000);

  return <h1>{seconds}</h1>;
}

export default CountDown;
