import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <article className="prose prose-neutral max-w-2xl space-y-4 text-[var(--ink)]">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
        Limits of self-testing
      </h1>
      <p>
        None of the instruments here are the validated clinical originals. The
        CI-inspired checklist mirrors CISS structure so you can track your own
        trend, but it has not been validated against clinical diagnosis, and
        totals should not be mapped onto published cutoffs.
      </p>
      <p>
        Pattern Glare Test norms exist in the literature, but this app does not
        reproduce proprietary clinical materials. Illusion counts are useful for
        your own trend — not population percentiles.
      </p>
      <p>
        Self-administered convergence testing is the weakest module
        epistemically. Near-point-of-convergence without a witness is unreliable;
        there is no substitute for a proper cover test / prism bar assessment.
      </p>
      <p>
        The point of PerceptLab is a well-organised conversation with a
        specialist, not a replacement for one. Expectation and placebo effects
        are real; treat small-sample &quot;this looks better&quot; results as
        hypotheses for the next five trials.
      </p>
      <p>
        If seizure-like symptoms ever appear (loss of awareness, jerking,
        blackouts), contact a GP immediately — independent of this app. This
        tool never uses flicker or strobe stimuli and does not screen for
        photosensitive epilepsy.
      </p>
      <p>
        <Link href="/" className="text-[var(--accent)] underline">
          Back home
        </Link>
      </p>
    </article>
  );
}
