import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames/bind';
import styles from './GiftCode.module.scss';

const cx = classNames.bind(styles);

const Triangle = ({ delay, color }) => (
  <motion.div
    className={cx('triangle')}
    style={{ backgroundColor: color }}
    initial={{ 
      scale: 0,
      opacity: 0,
      y: 0,
      x: 0,
      rotate: 0
    }}
    animate={{
      scale: [0, 1, 1, 0.5, 0],
      opacity: [0, 1, 1, 0.5, 0],
      y: [0, -300, -400], // Tăng khoảng cách di chuyển theo trục y
      x: [0, (Math.random() - 0.5) * 400], // Tăng khoảng cách di chuyển theo trục x
      rotate: [0, 360 * 2]
    }}
    transition={{
      duration: 1,
      delay,
      ease: "easeOut"
    }}
  />
);

const Confetti = () => {
  const colors = ['#FF6B6B', '#FF8E4F', '#4ECDC4', '#FFD93D'
    ];
  
  return (
    <div className={cx('confetti-container')}>
      {[...Array(240)].map((_, i) => (
        <Triangle 
          key={i} 
          delay={i * 0.1} 
          color={colors[Math.floor(Math.random() * colors.length)]}
        />
      ))}
    </div>
  );
};

export default Confetti;
