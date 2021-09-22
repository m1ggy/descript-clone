import React, { useState, useRef, useEffect } from 'react';

function CountDown({ delay = 3 }) {
  const [seconds, setSeconds] = useState(delay);
  const countRef = useRef(seconds);

  countRef.current = seconds;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (seconds <= 0) return;
      setSeconds(countRef.current - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  });

  return <h1>{seconds}</h1>;
}

export default CountDown;
