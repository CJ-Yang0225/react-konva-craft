import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof dynamicIconImports;
}

export const Icon = React.memo(({ name, ...props }: IconProps) => {
  const LucideIcon = lazy(dynamicIconImports[name]);

  const fallback = (
    <div
      style={{
        width: props.width ?? props.size,
        height: props.height ?? props.size,
      }}
    />
  );

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
});
