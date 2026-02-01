import React from 'react';

const SkeletonLoader = ({ className, variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-white/5 border border-white/5";
  
  const variantClasses = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4 w-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const MemberSkeleton = () => (
  <div className="glass-card-maroon p-5 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonLoader variant="circle" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <SkeletonLoader variant="text" className="w-1/2 h-5" />
        <SkeletonLoader variant="text" className="w-1/3 h-3" />
      </div>
    </div>
    <div className="space-y-3 pt-2">
      <SkeletonLoader className="h-16 w-full" />
      <SkeletonLoader className="h-20 w-full" />
      <SkeletonLoader className="h-20 w-full" />
    </div>
  </div>
);

export const ProjectSkeleton = () => (
  <div className="glass-card h-[400px] flex flex-col overflow-hidden">
    <SkeletonLoader className="h-48 w-full rounded-none" />
    <div className="p-5 flex-1 space-y-4">
      <div className="flex justify-between">
        <SkeletonLoader variant="text" className="w-1/4 h-3" />
        <SkeletonLoader variant="text" className="w-1/4 h-3" />
      </div>
      <SkeletonLoader variant="text" className="w-3/4 h-6" />
      <SkeletonLoader variant="text" className="w-full h-4" />
      <div className="pt-4 space-y-2">
        <SkeletonLoader variant="text" className="w-full h-2" />
        <div className="flex justify-between">
          <SkeletonLoader variant="text" className="w-1/3 h-3" />
          <SkeletonLoader variant="text" className="w-1/4 h-3" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
