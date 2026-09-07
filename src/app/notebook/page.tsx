import { Suspense } from "react";
import NotebookClient from "./NotebookClient";

export default function NotebookPage() {
  return (
    <Suspense fallback={<div className="screen-loading" />}>
      <NotebookClient />
    </Suspense>
  );
}
