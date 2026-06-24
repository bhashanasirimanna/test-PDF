"use client";

import { Mic, SendHorizonal } from "lucide-react";
import Image from "next/image";

export const AI_SUGGESTIONS: readonly string[] = [
  "Summarize the discussion on this paper",
  "Summarize key points of this paper",
  "Point out the changes since last meeting",
];

export function CosecAITab() {
  const hasMessages = false; // Placeholder for actual message state

  return (
    <div className="flex flex-col h-full min-w-[316px] bg-white pt-[16px] gap-[16px]">
      {/* Gradient header banner */}
      <div className="px-[16px] ">
        <div
          className=" rounded-[8px] py-[12px] flex flex-col justify-center items-center gap-[8px] bg-cover bg-no-repeat bg-center"
          style={{
            backgroundImage: "url('/ai-assistant/ai-header-background.svg')",
          }}
        >
          <div className="rounded-full border-[7.92px] border-white/[0.64] bg-gradient-to-tr from-[#F97316] to-[#8A38F5]">
            <Image
              src="/ai-assistant/ai-assistant.png"
              alt="CoSec AI"
              width={53}
              height={53}
              className="h-[53px] w-[53px] aspect-square rounded-full"
            />
          </div>
          <div className="">
            <p className="text-[14px] font-semibold text-white text-center">
              CoSec AI
            </p>
            <p className="text-[12px] text-white text-center">
              Hi.. I'm here to help. ask anything.
            </p>
          </div>
        </div>
      </div>

      {/* Conversation area */}
      <div className={`flex-1 flex-col overflow-y-auto px-[16px] ${!hasMessages ? "justify-end" : "justify-start"}`}>
        {!hasMessages ? (
          <div className="flex flex-col items-start gap-[1.111vh] pb-[2.889vh]">
            {AI_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {}}
                className=" max-h-[3.556vh] inline-flex items-center gap-[0.444vh] rounded-full border border-[#CBD5E1] py-[1.778vh] pr-[0.889vh] pl-[1.333vh] text-[1.333vh] text-[#303030] transition-colors hover:border-[#E56F8C]/50 hover:bg-[#E56F8C]/5"
              >
                {s}
                <Image
                  src="/icons/arrowRightStroke.svg"
                  alt="Ask CoSec AI"
                  width={16}
                  height={16}
                  className="h-[2.667vh] w-[2.667vh]"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Input pill */}
      <div className="p-[16px] border-t border-[#EDEFFA]">
        <div className=" bg-gradient-to-r from-[#7C3AED] to-[#F97316] p-[1px] rounded-full">
            <div className="flex items-center justify-between gap-[0.801vh] rounded-full bg-white py-[0.444vh] pl-[1.667vh] pr-[0.444vh] shadow-[0.222vh_0.333vh_1.711vh_0vh_#7C3AED40,-0.222vh_-0.111vh_1.333vh_0vh_#F9731640]">
              <div className="flex items-center justify-start gap-[0.889vh]">
                <Mic className="h-[2.667vh] w-[2.667vh] shrink-0 text-[#000000]/75" />
                <input
                  type="text"
                  // value={value}
                  // onChange={(e) => setValue(e.target.value)}
                  // onKeyDown={onKeyDown}
                  // disabled={isLoading}
                  placeholder={`Ask any thing, Rayan….`}
                  className="flex-1 bg-transparent text-[12px] leading-[11.39px] outline-none placeholder:text-[#94A3B8] disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                // onClick={() => submit(value)}
                // disabled={!value.trim() || isLoading}
                aria-label="Send"
                className="flex h-[3.778vh] w-[3.778vh] items-center justify-center rounded-full bg-[#0F172A] text-white disabled:opacity-50"
              >
                <SendHorizonal className="h-[1.998vh] w-[1.998vh]" />
              </button>
            </div>
          </div>
      </div>
    </div>
  );
}
