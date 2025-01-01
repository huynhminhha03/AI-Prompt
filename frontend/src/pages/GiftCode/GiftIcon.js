import React from "react";
import { motion } from "framer-motion";
import classNames from "classnames/bind";
import styles from "./GiftCode.module.scss";

const cx = classNames.bind(styles);

const GiftIcon = ({ isOpen }) => (
  <svg viewBox="0 0 100 100" className={cx("icon")}>
    {/* Gift box base */}
    <motion.rect
      x="20"
      y="35"
      width="60"
      height="50"
      rx="5"
      fill="#195a97" // Yellow color
      initial={{ y: 0 }}
      animate={{ 
        y: isOpen ? [0, -5, 0] : 0,
        rotate: isOpen ? [-3, 3, 0] : 0
      }}
      transition={{ duration: 0.5 }}
    />
    
    {/* Gift box lid */}
    <motion.g
      initial={{ rotate: 0, y: 0 }}
      animate={{ 
        rotate: isOpen ? -45 : 0,
        y: isOpen ? -20 : 0,
      }}
      transition={{ duration: 0.5 }}
      style={{ transformOrigin: '50px 25px' }}
    >
      <motion.rect
        x="15"
        y="25"
        width="70"
        height="15"
        rx="3"
        fill="#FFD700" // Yellow color
      />
      {/* Bow center */}
      <circle cx="50" cy="25" r="5" fill="#FF0000" />
    </motion.g>
    
    {/* Vertical ribbon */}
    <motion.rect
      x="48"
      y="35"
      width="4"
      height="50"
      fill="#FF0000" // Red color
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />
    
    {/* Horizontal ribbon */}
    <motion.rect
      x="20"
      y="55"
      width="60"
      height="4"
      fill="#FF0000" // Red color
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />
    
    {/* Bow left */}
    <motion.path
      d="M50 25 Q40 15 30 25"
      stroke="#FF0000" // Red color
      strokeWidth="4"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    />
    
    {/* Bow right */}
    <motion.path
      d="M50 25 Q60 15 70 25"
      stroke="#FF0000" // Red color
      strokeWidth="4"
      fill="none"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    />
  </svg>
);

export default GiftIcon;

