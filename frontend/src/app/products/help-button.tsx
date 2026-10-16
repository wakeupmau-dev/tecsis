"use client";

import { MessageCircleQuestionMark } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import Input from "@/components/Input";
import { content, type Locale } from "@/content";

const LABEL_CLASS = "font-light text-[#595959]";
const AUTO_OPEN_DELAY_MS = 5000;
const AUTO_OPENED_KEY = "tecsis:help-form-auto-opened";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactResult = "saved" | "invalid" | "limited" | "failed";

async function submitContact(
  form: FormData,
  locale: Locale,
): Promise<ContactResult> {
  try {
    const res = await fetch("/api/leads/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        company: form.get("company"),
        role: form.get("role"),
        email: form.get("email"),
        locale,
      }),
    });
    if (res.ok) return "saved";
    if (res.status === 400) return "invalid";
    if (res.status === 429) return "limited";
    return "failed";
  } catch {
    return "failed";
  }
}

// Storage can be blocked (private mode, disabled site data); treat that as
// "not seen yet" and skip the write.
function readFlag(key: string) {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {}
}

export default function HelpButton({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const text = content[locale].helpForm;

  // First visit only: open the form by itself after a few seconds.
  useEffect(() => {
    if (readFlag(AUTO_OPENED_KEY)) return;

    function autoOpen() {
      // Opened by hand within the delay: leave it as the visitor left it.
      if (readFlag(AUTO_OPENED_KEY)) return;
      writeFlag(AUTO_OPENED_KEY);
      setOpen(true);
    }

    const timer = setTimeout(autoOpen, AUTO_OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function toggle() {
    writeFlag(AUTO_OPENED_KEY);
    setOpen(!open);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!EMAIL_REGEX.test(String(data.get("email") ?? "").trim())) {
      setResult("invalid");
      return;
    }

    setResult(null);
    setSubmitting(true);
    const next = await submitContact(data, locale);
    setSubmitting(false);
    setResult(next);
    if (next === "saved") form.reset();
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.2, opacity: { duration: 0.1 } },
            }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm origin-bottom-right flex flex-col gap-y-4 p-6 bg-white rounded-2xl shadow-xl"
          >
            <h2 className="mb-4 text-card">{text.title}</h2>
            <Input
              name="name"
              label={text.nameLabel}
              labelClassName={LABEL_CLASS}
            />
            <Input
              name="company"
              label={text.companyLabel}
              labelClassName={LABEL_CLASS}
            />
            <Input
              name="role"
              label={text.roleLabel}
              labelClassName={LABEL_CLASS}
            />
            <Input
              name="email"
              label={text.emailLabel}
              type="email"
              labelClassName={LABEL_CLASS}
            />
            <button
              type="submit"
              disabled={submitting}
              className={`mt-2 h-15 rounded-full bg-[#122991] text-white flex items-center justify-center gap-x-2 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
              )}
              {result === "saved" ? text.submitted : text.submit}
            </button>
            <p
              aria-live="polite"
              className={`min-h-6 px-6 text-[0.9rem] ${result === "saved" ? "text-gray-800" : "text-red-600"}`}
            >
              {result && text.messages[result]}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        aria-label={text.open}
        aria-expanded={open}
        onClick={toggle}
        whileHover={{ scale: 1.2, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 400, damping: 16 }}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#122991] text-white shadow-lg cursor-pointer"
      >
        <MessageCircleQuestionMark className="size-7" />
      </motion.button>
    </>
  );
}
