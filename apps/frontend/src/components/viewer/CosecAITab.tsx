'use client';

export function CosecAITab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" strokeLinejoin="round" />
          <path d="M19 16L19.75 18.25L22 19L19.75 19.75L19 22L18.25 19.75L16 19L18.25 18.25L19 16Z" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-800 mb-1">Cosec AI</p>
      <p className="text-xs text-slate-400 leading-relaxed">
        AI-powered document insights are coming soon.
      </p>
    </div>
  );
}
