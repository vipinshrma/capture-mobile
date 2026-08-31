"use client";

import { FormEvent, useRef, useState } from "react";
import { FORM_ENDPOINT, FORMSPREE_FORM_ID, THANKS_URL } from "../lib/config";

type FormState = "idle" | "loading" | "success" | "error" | "unconfigured";

export function WaitlistForm() {
  const [state, setState] = useState<FormState>("idle");
  const submitting = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    event.preventDefault();
    if (!form.reportValidity() || submitting.current) return;
    if (!FORMSPREE_FORM_ID) {
      setState("unconfigured");
      return;
    }

    submitting.current = true;
    setState("loading");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Submission failed");
      setState("success");
      window.location.assign("/thanks");
    } catch {
      submitting.current = false;
      setState("error");
    }
  }

  const message = {
    idle: "",
    loading: "Submitting your request…",
    success: "Registration confirmed. Opening the confirmation page…",
    error: "We couldn’t join the waitlist. Your details are still here. Please try again.",
    unconfigured: "Waitlist submissions are not configured yet. Add NEXT_PUBLIC_FORMSPREE_FORM_ID before launch.",
  }[state];

  return (
    <form className="waitlist-form" action={FORM_ENDPOINT || undefined} method="post" onSubmit={submit}>
      {state !== "success" && (
        <>
          <div className="form-grid">
            <label className="field">
              <span>Email address</span>
              <input type="email" name="email" autoComplete="email" placeholder="you@example.com" required />
            </label>
            <fieldset className="field platform-field">
              <legend>Your phone</legend>
              <div className="segmented">
                {['iOS', 'Android', 'Both'].map((platform, index) => (
                  <label key={platform}>
                    <input type="radio" name="platform" value={platform} required={index === 0} />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <label className="consent">
            <input type="checkbox" name="consent" value="yes" required />
            <span>Email me about beta access and important launch updates.</span>
          </label>
          <label className="honeypot" aria-hidden="true">
            Leave this field empty
            <input name="_gotcha" tabIndex={-1} autoComplete="off" />
          </label>
          <input type="hidden" name="_subject" value="New Tuck waitlist signup" />
          <input type="hidden" name="_next" value={THANKS_URL} />
          <button className="button" type="submit" disabled={state === "loading"}>
            {state === "loading" ? "Joining…" : state === "error" ? "Try again" : "Join waitlist"}
          </button>
        </>
      )}
      <p className="form-status" data-state={state} aria-live="polite">{message}</p>
      <noscript><p className="form-note">JavaScript is off. The form will use Formspree’s standard confirmation page.</p></noscript>
    </form>
  );
}
