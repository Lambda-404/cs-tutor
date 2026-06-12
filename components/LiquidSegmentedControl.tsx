import React, { useRef, useEffect, useState } from 'react';

interface Option {
    id: string;
    label: string | React.ReactNode;
}

interface LiquidSegmentedControlProps {
    options: Option[];
    activeId: string;
    onSelect: (id: string) => void;
    className?: string;
}

export const LiquidSegmentedControl: React.FC<LiquidSegmentedControlProps> = ({ options, activeId, onSelect, className = '' }) => {
    const baseLayerRef = useRef<HTMLDivElement>(null);
    const [pillStyle, setPillStyle] = useState({ left: '0px', width: '0px', opacity: 0 });
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!baseLayerRef.current) return;
        
        const activeIndex = options.findIndex(o => o.id === activeId);
        if (activeIndex === -1) return;

        const updatePill = () => {
            if (baseLayerRef.current) {
                const activeLabelElement = baseLayerRef.current.children[activeIndex] as HTMLElement;
                
                if (activeLabelElement) {
                    setPillStyle({
                        left: `${activeLabelElement.offsetLeft}px`,
                        width: `${activeLabelElement.offsetWidth}px`,
                        opacity: 1
                    });
                    setContainerWidth(baseLayerRef.current.offsetWidth);
                }
            }
        };

        // Delay to ensure exact width calculating on first render if fonts are loading
        setTimeout(updatePill, 10);
        window.addEventListener('resize', updatePill);
        return () => window.removeEventListener('resize', updatePill);
    }, [activeId, options]);

    return (
        <div className={`relative inline-flex items-center p-1 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-3xl shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)] ${className}`}>
            
            <div ref={baseLayerRef} className="relative flex items-center w-full z-0">
                
                {/* The Sliding Pill */}
                <div 
                    className="absolute top-0 bottom-0 rounded-full overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] z-10 pointer-events-none"
                    style={{ ...pillStyle, transitionProperty: 'left, width, opacity' }}
                >
                    {/* Glass Background */}
                    <div className="absolute inset-0 bg-white dark:bg-[#3A3A3C] shadow-[0_4px_12px_rgba(0,0,0,0.08),_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3),_0_1px_2px_rgba(0,0,0,0.2)] border border-black/5 dark:border-white/10" />
                    
                    {/* Active Text Mask (counter-shifted to align with base text perfectly) */}
                    <div 
                        className="absolute top-0 bottom-0 flex items-center transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ left: `-${parseFloat(pillStyle.left || '0')}px`, width: `${containerWidth}px` }}
                    >
                        {options.map((opt) => (
                            <div key={opt.id} className="px-5 py-2 flex-1 rounded-full text-[13px] font-semibold tracking-wide whitespace-nowrap text-center text-black dark:text-white pointer-events-none">
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Base Interactive Buttons */}
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelect(opt.id);
                        }}
                        className={`relative z-20 px-5 py-2 flex-1 rounded-full text-[13px] font-semibold tracking-wide whitespace-nowrap text-center outline-none cursor-pointer transition-colors duration-400 ${
                            activeId === opt.id ? 'text-transparent' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}

            </div>
        </div>
    );
};
