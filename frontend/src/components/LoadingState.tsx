const LoadingState = ({ message }: { message: string }) => (
  <div className="text-center p-6">
    <div className="loading-spinner"></div>
    <p className="mt-2 text-muted-foreground">{message}</p>
  </div>
);

export default LoadingState;