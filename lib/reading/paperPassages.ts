import type { ReadingPassage } from "../types";

function countWords(paragraphs: string[]): number {
  return paragraphs
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function paper(
  id: string,
  title: string,
  paragraphs: string[],
): ReadingPassage {
  return {
    id,
    title,
    paragraphs,
    totalWords: countWords(paragraphs),
    createdAt: "2026-01-01T00:00:00.000Z",
    source: "builtin-paper",
  };
}

/**
 * Original academic-style excerpts for ecological reading trials.
 * Stable IDs — do not regenerate per session.
 */
export const PAPER_PASSAGES: ReadingPassage[] = [
  paper("paper-visual-cortex-01", "Notes on cortical responses to patterned light", [
    "Contemporary accounts of visual discomfort often begin with the observation that certain static patterns—especially high-contrast stripes near three cycles per degree—can elicit illusions of motion, colour, and shape in susceptible observers. These phenomena are not merely anecdotal; they have been linked to measures of cortical excitability and to clinical constructs such as pattern glare. Importantly, the same spatial structure that characterises laboratory gratings is also present, in attenuated form, in dense printed text, where horizontal lines of type and vertical letter strokes create a quasi-periodic field.",
    "When readers report that words appear to shimmer or that lines seem to bend, the explanation need not invoke refractive error alone. Binocular coordination failures and accommodative strain can produce overlapping complaints—losing place, re-reading, and fatigue—yet the temporal profile and stimulus dependence of symptoms can help distinguish mechanisms. A pattern that worsens specifically with striped wallpaper or tightly set type, and that improves under a coloured overlay, points toward a different causal story than diplopia at near that resolves with vergence exercises.",
    "Methodologically, self-administered tools cannot replace a binocular vision examination. What they can do is organise evidence: repeated measures under controlled conditions, logged confounders such as sleep and caffeine, and an exportable record that makes a subsequent clinical conversation more efficient. The goal is not diagnosis from a browser, but a clearer map of which stimuli provoke which complaints, and which low-cost adjustments appear to help that particular reader.",
    "Future work in this personal measurement tradition should continue to separate expectation effects from durable gains. Colour preferences are visible to the observer; complete blinding is therefore impossible. Counterbalancing, minimum sample sizes, and effect sizes reported alongside significance remain the practical safeguards available in an N-of-1 design conducted outside a laboratory.",
  ]),
  paper("paper-near-work-02", "Near work, fatigue, and the limits of acuity charts", [
    "Standard acuity charts answer a narrow question: can the observer resolve high-contrast letters at a specified distance? They do not ask whether the eyes can sustain comfortable binocular alignment for thirty minutes of continuous reading, nor whether the visual system finds dense typography aversive. Convergence insufficiency and related binocular disorders illustrate the gap. Patients may pass a distance screening yet describe swimming print, intermittent blur, and an urge to close one eye during near tasks.",
    "Symptom inventories developed for clinical screening capture domains such as eyestrain, headache, diplopia, and loss of place. When adapted carefully for personal tracking—without claiming equivalence to validated cutoffs—they provide a longitudinal signal. Combined with a logged near point of convergence and a simple digital saccade timing task, they form a rough but useful baseline against which interventions can be compared.",
    "Interventions themselves should be tested as hypotheses. Increasing font size, widening line spacing, or applying a translucent tint may each reduce demand on a different subsystem. Testing them all simultaneously confounds interpretation; testing them in an adaptive sequence—first identifying promising families from baseline signals, then confirming a small composite profile—better matches the practical question a reader actually asks: what should I change on my screen tomorrow?",
    "Ecological validity matters. Passages built from scrambled function words isolate visual factors from comprehension, but they rarely resemble the documents people struggle with: articles, reports, and papers. Using continuous prose does reintroduce vocabulary and interest as noise, yet for personal decision-making that tradeoff is often acceptable, especially when the same passages are reused across conditions.",
  ]),
  paper("paper-overlays-03", "Colour, contrast, and individual differences", [
    "Coloured overlays and precision tints occupy a contested place in the literature on reading difficulties and visual stress. Some studies report meaningful gains in rate of reading for selected individuals; others find small average effects and emphasise placebo and selection. The most consistent methodological lesson is heterogeneity: an overlay that helps one observer may hinder another, and group means can obscure clinically relevant personal responses.",
    "From a design standpoint, this heterogeneity argues for within-subject experimentation rather than population norms. A personal toolkit can vary hue, saturation, and opacity while holding text content constant, then compare objective reading time and subjective discomfort. Partial blinding—hiding running averages during data collection—reduces the temptation to try harder once a favourite colour appears to win.",
    "Contrast polarity deserves similar attention. Dark text on a bright field maximises the stripe energy of text lines; light text on a dark field changes the luminance profile and may reduce glare for some users while increasing halation for others. Font choice and spacing alter the effective duty cycle and spatial frequency of the text pattern itself. These levers are cheap to adjust digitally and therefore ideal candidates for structured self-tests.",
    "None of these adjustments substitutes for addressing uncorrected refractive error or significant binocular dysfunction. They are adjuncts: ways to make necessary near work more tolerable while professional care is sought, or to document which environmental modifications are worth discussing with a specialist.",
  ]),
  paper("paper-methods-04", "On N-of-1 measurement in everyday tools", [
    "Single-subject experimental designs have a long history in behavioural science and clinical optometry. Their logic is straightforward: if an individual is the population of interest, then repeated, counterbalanced exposure to conditions yields the relevant evidence. The statistical tools differ from between-group trials—paired contrasts, nonparametric tests, and effect sizes that remain interpretable at small n—but the discipline of pre-specifying comparisons still applies.",
    "Digital instruments make such designs newly practical. Timers, local storage, and simple charts remove much of the clerical burden that once made home measurement tedious. The risks shift toward overconfidence in noisy dashboards and toward interfaces that accidentally assist the very skill under test. A reading trial that highlights the current line, for example, functions as a reading ruler whether or not that aid is the intended condition.",
    "Therefore interface honesty is part of methodology. Stimuli meant to assess unaided reading should present continuous text without progressive disclosure that scaffolds place-keeping. Aids under evaluation should be applied deliberately and labelled as such. Safety constraints—no flicker, capped exposure to provocative gratings, mandatory rests—likewise belong in the protocol, not merely in the documentation.",
    "When personal data remain on-device by default, privacy aligns with the modest aims of the tool. Export exists for the user who wishes to share a summary; telemetry is unnecessary. The resulting artefact is less a product in the commercial sense than a structured notebook: a way to turn intermittent discomfort into a record that can travel into a clinic with the person who generated it.",
  ]),
  paper("paper-typography-05", "Typography as a controllable experimental factor", [
    "Typography is often treated as a matter of taste. For readers with visual stress or binocular strain, it is also a set of physical parameters: x-height, stroke contrast, inter-line spacing, and the spatial frequency content of the page. Changing from a compact serif at sixteen pixels to a larger, more open face at twenty pixels is not a cosmetic tweak; it is a change in the stimulus.",
    "Fonts marketed for dyslexia or low vision typically increase letter distinctiveness and aperture size. Whether they help a given reader is an empirical question. Including them alongside conventional serif and sans-serif options in a personal experiment costs little and may yield a clear preference on discomfort even when reading speed is unchanged.",
    "Line spacing and margins influence crowding and the tendency to skip or re-enter the wrong line. A reading ruler that masks surrounding lines targets that failure mode directly, but it should be tested as an intervention, not smuggled into the baseline task through UI chrome. Likewise, paste-your-own passages from real papers can validate that a preferred setting survives contact with familiar, motivating material.",
    "The practical endpoint is a short personal profile: a documented combination of size, font, spacing, and optional tint that outperforms baseline on metrics the user cares about, with sample size and effect size attached. That profile is provisional—screens change, fatigue varies—but it is more actionable than an unstructured impression that blue somehow feels nicer.",
  ]),
  paper("paper-clinical-06", "Bringing home measurements to a specialist visit", [
    "Clinicians routinely hear that reading is uncomfortable. They less often receive a timeline, a description of precipitating patterns, or a record of what was tried. A concise export that separates symptom trends from pattern-glare responses and from intervention comparisons can change the quality of that conversation without pretending to replace examination room tests.",
    "Useful packets emphasise uncertainty. They note which calibrations were low-confidence, which instruments were inspired by clinical tools rather than being those tools, and which findings are exploratory. They highlight witnessed versus self-observed near-point measures. They avoid mapping personal checklist totals onto published diagnostic cutoffs.",
    "For the person assembling such a packet, the workflow should feel like a path rather than a menu of disconnected modules: first characterise, then search for helpful adjustments with as few redundant trials as possible, then review. Playground experimentation remains valuable for curiosity, but it should not be confused with confirmatory testing.",
    "If seizure-like symptoms ever appear, the appropriate response is medical care, not further self-testing. Tools that deliberately avoid flicker still cannot rule out photosensitive epilepsy. Within their proper scope—organising visual discomfort around reading and patterns—they can reduce wasted effort and sharpen the questions brought to an optometrist or physician.",
  ]),
];

export function passagePlainText(p: ReadingPassage): string {
  if (p.paragraphs?.length) return p.paragraphs.join("\n\n");
  if (p.lines?.length) return p.lines.map((l) => l.join(" ")).join("\n");
  return "";
}

export function wordsInPassage(p: ReadingPassage): number {
  if (p.totalWords > 0) return p.totalWords;
  return countWords(
    p.paragraphs ??
      (p.lines ? p.lines.map((l) => l.join(" ")) : []),
  );
}

export function createCustomPassage(
  text: string,
  title?: string,
): ReadingPassage {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const paras =
    paragraphs.length > 0
      ? paragraphs
      : [text.trim().replace(/\s+/g, " ")].filter(Boolean);
  const id = `custom-${Date.now().toString(36)}`;
  return {
    id,
    title: title?.trim() || "Custom paste",
    paragraphs: paras,
    totalWords: countWords(paras),
    createdAt: new Date().toISOString(),
    source: "custom-paste",
  };
}
