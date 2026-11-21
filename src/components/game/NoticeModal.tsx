"use client";
import { CircleCheck, Info, CircleX } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function NoticeModal({ title, message, tone, onClose }: { title: string; message: string; tone: "good" | "bad" | "info"; onClose: () => void }) {
  const Icon = tone === "good" ? CircleCheck : tone === "bad" ? CircleX : Info;
  return (
    <Modal open label={title} dismissable={false} className="max-w-sm">
      <div className="p-6 text-center">
        <Icon size={48} className={`mx-auto ${tone === "good" ? "text-forest" : tone === "bad" ? "text-red-600" : "text-sky"}`} />
        <h3 className="mt-3 font-display text-2xl font-extrabold text-forest">{title}</h3>
        <p className="mt-2 text-ink/75">{message}</p>
        <button className="btn-gold mt-6 w-full" onClick={onClose}>
          Oke!
        </button>
      </div>
    </Modal>
  );
}
