import React from "react";

const NotesHeaderSkeleton = () => {
  return (
    <header className="flex justify-between items-center w-full flex-row  gap-6 mb-3 animate-pulse pt-5">
      <div className="flex items-center gap-4">
        {/* Three buttons skeleton */}
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="w-20 h-8 rounded-lg bg-[var(--bg-ter)] gap-4"
          />
        ))}
      </div>

      <div className="flex-1 max-w-2xl relative">
        {/* Search input skeleton */}
        <div className="w-full h-10 rounded bg-[var(--bg-ter)]" />
      </div>

      <div className="flex items-center gap-2">
        {/* New note button skeleton */}
        <div className="w-28 h-10 rounded-lg bg-[var(--btn)]" />
      </div>
    </header>
  );
};

export default NotesHeaderSkeleton;
