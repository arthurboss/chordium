import React from 'react';

export interface ScrollArrowProps {
	parentRef: React.RefObject<HTMLElement>;
	getTotalSize: () => number;
	className?: string;
	style?: React.CSSProperties;
}