import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { formatShort } from "@/lib/numbers";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  needFormatShort?: boolean;
  keepLastValidValue?: boolean;
}

export const AnimatedNumber = ({
  value,
  className,
  needFormatShort = true,
  keepLastValidValue = false,
}: AnimatedNumberProps) => {
  const lastValidValue = useRef<number>(value);
  const [currentValue, setCurrentValue] = useState(value);

  const springValue = useSpring(currentValue, {
    stiffness: 80,
    damping: 20,
    duration: 1.5,
  });

  const displayValue = useTransform(springValue, (val) => {
    // Control whether the numbers in the animation process are decimals or integers
    const processedVal = Number.isInteger(currentValue) ? Math.floor(val) : val;
    return needFormatShort
      ? formatShort(processedVal)
      : processedVal.toString();
  });

  useEffect(() => {
    if (keepLastValidValue) {
      // 如果启用了保持上一个有效值的功能
      if (value > 0) {
        // 只有当新值大于0时才更新
        lastValidValue.current = value;
        setCurrentValue(value);
        springValue.set(value);
      }
      // 如果新值为0或负数，保持当前值不变
    } else {
      // 原有行为：直接更新到新值
      setCurrentValue(value);
      springValue.set(value);
    }
  }, [value, springValue, keepLastValidValue]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};
