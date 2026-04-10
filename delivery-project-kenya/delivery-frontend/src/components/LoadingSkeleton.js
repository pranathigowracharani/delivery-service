import React from 'react';
import '../styles/LoadingSkeleton.css';

export function SkeletonCard() {
  return <div className="skeleton skeleton-card" />;
}

export function SkeletonRow() {
  return <div className="skeleton skeleton-row" />;
}

export function SkeletonText({ width = 'long' }) {
  return <div className={`skeleton skeleton-text ${width}`} />;
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ type = 'grid', count = 4 }) {
  if (type === 'grid') return <SkeletonGrid count={count} />;
  if (type === 'rows') {
    return (
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }
  return <SkeletonCard />;
}
