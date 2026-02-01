import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

const AnimatedNumber = ({ value, prefix = '₹' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {prefix}{Math.floor(displayValue).toLocaleString()}
    </span>
  );
};

export default AnimatedNumber;
