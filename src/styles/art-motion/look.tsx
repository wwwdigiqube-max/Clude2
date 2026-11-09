// A «-Look» composition for any Art Motion layout: frame i shows the video at times[i] (cheap stills before a render).
//   <Composition id="V01-Look" component={lookOf(Story, MY_STORY)} durationInFrames={1} … defaultProps={{ times: [0.3, 2, 5] }}
//     calculateMetadata={({ props }) => ({ durationInFrames: props.times.length })} />
import React from "react";
import { useCurrentFrame } from "remotion";

export const lookOf = <P extends object>(C: React.FC<P & { t?: number }>, props: P) => {
  const Look: React.FC<{ times: number[] }> = ({ times }) => {
    const f = useCurrentFrame();
    return <C {...props} t={times[Math.min(f, times.length - 1)]} />;
  };
  return Look;
};
