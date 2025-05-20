const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-cyan-100">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 