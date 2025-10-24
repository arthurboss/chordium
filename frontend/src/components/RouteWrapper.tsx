import { Suspense, ReactNode } from 'react';
import { RouteErrorBoundary, AsyncErrorBoundary } from './ErrorBoundaryWrappers';
import LoadingState from './LoadingState';

interface RouteWrapperProps {
	children: ReactNode;
	message?: string;
	fallback?: ReactNode;
}

export const RouteWrapper = ({
	children,
	message,
	fallback = <LoadingState message={message} />
}: RouteWrapperProps) => (
	<RouteErrorBoundary>
		<AsyncErrorBoundary>
			<Suspense fallback={fallback}>
				{children}
			</Suspense>
		</AsyncErrorBoundary>
	</RouteErrorBoundary>
);
