import Image from "next/image";
import { AppPreview } from "../components/AppPreview";
import { WaitlistForm } from "../components/WaitlistForm";
import { ThemeToggle } from "../components/ThemeToggle";

const captureTypes = [
  ["Links", "Share a useful page from your browser or paste its address."],
  ["Screenshots & photos", "Keep visual references beside everything else you save."],
  ["Notes", "Write down a thought before the moment passes."],
  ["PDFs & documents", "Store the files you need to revisit, available offline."],
  ["Voice notes", "Record an idea and play it back from its capture."],
  ["Tasks & reminders", "Save a task, then schedule a local reminder to return to it."],
];

const workflow = [
  ["Tuck", "Share from another app or use Quick Capture.", "capture"],
  ["Inbox", "Everything arrives without titles, folders, or tags.", "inbox"],
  ["Search", "Search text and notes, then filter by type or date.", "search"],
  ["Review", "Keep, archive, open, or schedule a reminder.", "review"],
] as const;

const gallery = [
  ["inbox", "Inbox", "Everything you saved, in one calm place."],
  ["capture", "Quick Capture", "Note, voice, photo, or link in a few taps."],
  ["search", "Search", "Combine text, type, and date filters."],
  ["detail", "Capture Detail", "Play, note, share, favourite, or archive."],
  ["review", "Review", "Make a decision now or return later."],
] as const;

const faqs = [
  ["What can I save in Tuck?", "Links, screenshots, photos, notes, PDFs, documents, voice notes, and simple tasks."],
  ["Is Tuck available for iOS and Android?", "Tuck is being prepared for private beta testing on both iOS and Android."],
  ["Do I need an account?", "No. Tuck’s core local experience does not require an account."],
  ["Does Tuck work offline?", "Yes. Saved captures and local attachments remain available without a connection."],
  ["Where is my content stored?", "In Tuck’s protected local app storage on your device. Android cloud backup is disabled."],
  ["When will the beta be available?", "We’re testing the core experience now. Waitlist members will be invited in small groups."],
];

function Brand() {
  return <span className="brand"><Image src="/assets/logo.svg" alt="" width={38} height={38} priority /><span>Tuck</span></span>;
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="shell nav-wrap">
          <a href="#top" aria-label="Tuck home"><Brand /></a>
          <nav aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#privacy">Privacy</a>
            <ThemeToggle />
            <a className="button button-small" href="#waitlist">Join waitlist</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero section" id="top">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Private beta · iOS &amp; Android</p>
              <h1>Save it now.<br />Find it when it matters.</h1>
              <p className="lede">Tuck is one private inbox for links, screenshots, notes, documents, and voice notes, without folders, tags, or setup.</p>
              <WaitlistForm />
              <a className="text-link" href="#how-it-works">See how it works</a>
            </div>
            <div className="hero-visual" aria-label="Tuck Inbox, Quick Capture, and Search screens">
              <figure className="phone phone-left"><AppPreview kind="capture" /></figure>
              <figure className="phone phone-center"><AppPreview kind="inbox" /></figure>
              <figure className="phone phone-right"><AppPreview kind="search" /></figure>
            </div>
          </div>
        </section>

        <section className="problem section" aria-labelledby="problem-title">
          <div className="shell narrow">
            <h2 id="problem-title">Your save-later system shouldn’t need organizing.</h2>
            <div className="pain-grid">
              <article><span>01</span><p>Useful links disappear across chats, tabs, and bookmarks.</p></article>
              <article><span>02</span><p>Screenshots and files become difficult to find.</p></article>
              <article><span>03</span><p>Organizing content at capture time creates friction.</p></article>
            </div>
            <p className="closing-copy">Tuck gives everything one temporary home. <strong>Organize nothing. Just capture it.</strong></p>
          </div>
        </section>

        <section className="capture section" aria-labelledby="capture-title">
          <div className="shell">
            <div className="section-heading"><p className="kicker">Capture anything</p><h2 id="capture-title">One inbox for everything worth remembering.</h2></div>
            <div className="capture-grid">
              {captureTypes.map(([title, copy]) => <article className="capture-card" key={title}><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className="workflow section" id="how-it-works" aria-labelledby="workflow-title">
          <div className="shell">
            <div className="section-heading centered"><h2 id="workflow-title">Tuck. Find. Review.</h2><p>Capture first. Decide what matters when you have time.</p></div>
            <ol className="workflow-list">
              {workflow.map(([title, copy, kind], index) => <li key={title}><span className="step">{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><AppPreview kind={kind} compact /></li>)}
            </ol>
          </div>
        </section>

        <section className="gallery section" aria-labelledby="gallery-title">
          <div className="shell">
            <div className="section-heading"><h2 id="gallery-title">Quiet by design. Useful by default.</h2><p>Product flows shown with non-personal sample content.</p></div>
            <div className="gallery-grid" aria-label="Product previews">
              {gallery.map(([kind, title, copy]) => <figure key={title}><div className="device"><AppPreview kind={kind} /></div><figcaption><strong>{title}</strong><span>{copy}</span></figcaption></figure>)}
            </div>
            <p className="preview-note">Preview screens use the current app UI and sanitized content. Replace them with final same-size device captures before launch.</p>
          </div>
        </section>

        <section className="privacy section" id="privacy" aria-labelledby="privacy-title">
          <div className="shell privacy-grid">
            <div><p className="kicker">No account. No cloud library.</p><h2 id="privacy-title">Private by default.</h2><p className="privacy-lede">Tuck is designed as a local app first, so your captures stay on the device you used to save them.</p></div>
            <div className="promise-list">
              <article><div><h3>Stored locally</h3><p>Captures remain in Tuck’s protected local app storage.</p></div></article>
              <article><div><h3>No account required</h3><p>Open Tuck and start saving without creating a profile.</p></div></article>
              <article><div><h3>Delete whenever you want</h3><p>Remove all captures and their attachments from Settings.</p></div></article>
            </div>
            <div className="privacy-facts"><p>Android cloud backup is disabled.</p><p>Saved links are not automatically fetched for metadata.</p><p>Waitlist email is sent only to the hosted form provider.</p></div>
          </div>
        </section>

        <section className="faq section" id="faq" aria-labelledby="faq-title">
          <div className="shell faq-grid">
            <div className="section-heading"><h2 id="faq-title">The useful details.</h2></div>
            <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="final-cta section" id="waitlist" aria-labelledby="waitlist-title">
          <div className="shell cta-card">
            <div><h2 id="waitlist-title">Ready for a calmer inbox?</h2><p>Join the private beta waitlist. No spam, only beta access and important launch updates.</p><div className="cta-links"><a href="#privacy">Privacy</a><a href="#faq">FAQ</a></div></div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div><a href="#top"><Brand /></a><p>A private inbox for everything.</p></div>
          <div className="footer-links"><a href="mailto:hello@example.com">Contact</a><a href="#privacy">Privacy</a><a href="#faq">FAQ</a></div>
          <p>© {new Date().getFullYear()} Tuck</p>
        </div>
      </footer>
    </>
  );
}
