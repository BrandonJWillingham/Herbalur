"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-[#26432c] px-5 py-3 text-sm font-medium text-white print:hidden"
    >
      Print order
    </button>
  );
}