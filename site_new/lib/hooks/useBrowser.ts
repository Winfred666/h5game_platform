import { useCallback, useEffect, useRef, useState } from "react";

export const useOutsideClick = (callback:()=>void) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleClick = (event:MouseEvent) => {
      if (ref.current && event.target && !((ref.current as any).contains(event.target))) {
        callback();
      }
    };
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [ref]);
  return ref;
};

export const useWindowSize = () => {
  // 初始值设为 null 标识未初始化
  const [size, setSize] = useState<{
    width: number | null;
    height: number | null;
  }>({
    width: null,
    height: null
  });

  // 安全的尺寸更新函数（带防抖）
  const updateSize = useCallback(() => {
    // 客户端安全检测
    if (typeof window === 'undefined') return;
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  useEffect(() => {
    // 客户端检查
    if (typeof window === 'undefined') return;
    // 初始化设置
    updateSize();
    // 添加防抖的resize监听
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSize, 100);
    };
    window.addEventListener('resize', handleResize);
    // 清理函数
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateSize]); // 依赖稳定的回调

  return size;
};
