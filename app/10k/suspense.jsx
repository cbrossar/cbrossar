import { Suspense } from "react";

const SuspenseBoundary = ({ children }) => (
    <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
);

export default SuspenseBoundary;
