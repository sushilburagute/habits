import { useEffect, type ReactNode } from "react";
import { ChevronDown, Github } from "lucide-react";

import type { HabitColor } from "@/db/database.type";
import { HABIT_COLOR_CONFIG } from "@/constants/colors";
import { HERO_HABITS, REPO_URL } from "@/constants/landing";
import { getCellBackground } from "@/lib/heatmap";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YearGrid } from "@/components/landing/YearGrid";
import { cn } from "@/lib/utils";

type LandingProps = {
  onStart: () => void;
};

export function Landing({ onStart }: LandingProps) {
  // Arriving from the app's wordmark should land at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-dvh">
      {/* Mirrors the app header exactly, so the wordmark does not move when you enter. */}
      <Container>
        <header className="mt-6 flex flex-wrap items-center justify-between gap-3 md:mt-12 md:gap-6">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight md:text-xl">
            <span className="font-mono lowercase text-foreground">habits</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="icon" asChild>
              <a href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Source on GitHub">
                <Github className="h-[1.2rem] w-[1.2rem]" />
              </a>
            </Button>
            <Button onClick={onStart} className="hidden sm:inline-flex">
              Start tracking
            </Button>
          </div>
        </header>
      </Container>

      <main>
        <section className="pt-14 pb-16 sm:pt-20 sm:pb-24">
          <Container>
            <h1
              className="lp-rise font-display max-w-[16ch] text-[clamp(2.75rem,8vw,6rem)] leading-[0.94] font-semibold tracking-[-0.045em]"
              style={{ animationDelay: "60ms" }}
            >
              Your year,
              <br />
              <span className="text-muted-foreground">one square at a time.</span>
            </h1>

            <p
              className="lp-rise mt-7 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              A habit tracker that runs entirely in your browser. Check in each day, watch the grid
              fill, and keep every record on your own device.
            </p>

            <div
              className="lp-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <Button size="lg" onClick={onStart}>
                Start tracking
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                  View source
                </a>
              </Button>
            </div>
          </Container>

          {/* The grid is the one element allowed past the text rail. */}
          <div className="mx-auto mt-16 w-full max-w-[88rem] px-5 sm:mt-24 sm:px-8">
            <YearGrid />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {HERO_HABITS.map((habit) => (
                  <li key={habit.name} className="flex items-center gap-2 font-mono text-xs">
                    <ColorChip color={habit.color} />
                    <span className="text-muted-foreground">{habit.name}</span>
                  </li>
                ))}
              </ul>
              <p className="font-mono text-xs text-muted-foreground/70">
                tap or drag to fill a day
              </p>
            </div>
          </div>
        </section>

        <Container>
          <Section title="Built around one picture.">
            <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div key={feature.title}>
                  <ColorChip color={feature.color} className="size-3" />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Four ways to look at the same year."
            lede="Each view zooms out a little further, from the check-in you owe today to everything you have ever logged."
          >
            <div className="divide-y divide-border/60">
              {VIEWS.map((view) => (
                <div
                  key={view.name}
                  className="grid items-center gap-x-8 gap-y-4 py-7 sm:grid-cols-[5.5rem_minmax(0,1fr)] lg:grid-cols-[5.5rem_minmax(0,22rem)_minmax(0,1fr)]"
                >
                  <span className="font-mono text-xs text-muted-foreground">{view.span}</span>
                  <div>
                    <h3 className="font-semibold tracking-tight">{view.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{view.body}</p>
                  </div>
                  <div>{view.visual}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Nothing leaves this tab."
            lede="There is no server to talk to. Habits, check-ins, and settings are written to IndexedDB in this browser, and once the app has loaded it stops using the network entirely."
          >
            <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/20 font-mono text-xs">
              <div className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-2.5">
                <span className="tracking-widest text-muted-foreground uppercase">Network</span>
                <span className="text-muted-foreground">0 requests · 0 B transferred</span>
              </div>
              <div className="grid grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-4 border-b border-border/70 px-4 py-2 text-[11px] tracking-wider text-muted-foreground/70 uppercase">
                <span>Name</span>
                <span>Status</span>
                <span>Size</span>
                <span>Time</span>
              </div>
              <p className="px-4 py-12 text-center text-muted-foreground/70">Nothing recorded.</p>
            </div>

            <p className="mt-8 max-w-2xl text-muted-foreground">
              No sign-up, no sync, no analytics, no third-party scripts. The one copy of your data
              that can ever leave the device is the JSON backup you export yourself.
            </p>
          </Section>

          <Section
            title="Install it like an app."
            lede="Habits is a progressive web app, so it can live in your dock or home screen and open without a connection."
          >
            <ol className="grid gap-10 sm:grid-cols-3">
              {INSTALL_STEPS.map((step, index) => (
                <li key={step}>
                  <span className="font-mono text-sm text-muted-foreground/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section title="Questions.">
            <div className="divide-y divide-border/60 border-y border-border/60">
              {FAQ.map((item) => (
                <details key={item.question} className="lp-faq">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </summary>
                  <p className="max-w-2xl pb-6 text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </Section>

          <section className="border-t border-border/60 py-20 sm:py-28">
            <h2 className="font-display max-w-[14ch] text-3xl font-semibold tracking-[-0.035em] text-pretty sm:text-5xl">
              Today is one square.
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Add your first habit and check it off. Nothing to sign up for.
            </p>
            <Button size="lg" className="mt-8" onClick={onStart}>
              Start tracking
            </Button>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 py-8 font-mono text-xs text-muted-foreground">
            <span className="lowercase">habits</span>
            <div className="flex items-center gap-5">
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-foreground"
              >
                GitHub
              </a>
              <a
                href={`${REPO_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-foreground"
              >
                MIT
              </a>
            </div>
          </footer>
        </Container>
      </main>
    </div>
  );
}

type SectionProps = {
  title: string;
  lede?: string;
  children: ReactNode;
};

function Section({ title, lede, children }: SectionProps) {
  return (
    <section className="border-t border-border/60 py-20 sm:py-28">
      <h2 className="font-display max-w-[20ch] text-3xl font-semibold tracking-[-0.035em] text-pretty sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="mt-5 max-w-2xl text-muted-foreground">{lede}</p>}
      <div className="mt-12">{children}</div>
    </section>
  );
}

function ColorChip({ color, className }: { color: HabitColor; className?: string }) {
  return (
    <span
      className={cn("inline-block size-2.5 rounded-[3px]", className)}
      style={{ backgroundColor: HABIT_COLOR_CONFIG[color].hex }}
    />
  );
}

/** A heatmap fragment whose width is proportional to the span it represents. */
function MiniHeatmap({ columns, color, seed }: { columns: number; color: HabitColor; seed: number }) {
  const hex = HABIT_COLOR_CONFIG[color].hex;
  const random = makeRandom(seed);

  return (
    <div
      className="flex max-w-full gap-[2px]"
      style={{ width: columns * 7 }}
      aria-hidden="true"
    >
      {Array.from({ length: columns }).map((_, column) => (
        <div key={column} className="flex min-w-0 flex-1 flex-col gap-[2px]">
          {Array.from({ length: 7 }).map((_, row) => {
            const level = random() > 0.6 ? 1 + Math.floor(random() * 4) : 0;
            return (
              <span
                key={row}
                className="aspect-square w-full rounded-[1px] bg-muted/60"
                style={{
                  backgroundColor: level === 0 ? undefined : getCellBackground(hex, level),
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Stats aggregates rather than a calendar, so it gets bars instead of squares. */
function MiniBars({ color }: { color: HabitColor }) {
  const hex = HABIT_COLOR_CONFIG[color].hex;
  const widths = [100, 72, 54, 31];

  return (
    <div className="w-full max-w-[13rem] space-y-[6px]" aria-hidden="true">
      {widths.map((width) => (
        <span
          key={width}
          className="block h-[5px] rounded-[1px]"
          style={{ width: `${width}%`, backgroundColor: getCellBackground(hex, 3) }}
        />
      ))}
    </div>
  );
}

function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const FEATURES: Array<{ title: string; body: string; color: HabitColor }> = [
  {
    color: "emerald",
    title: "A contribution graph per habit",
    body: "Every habit gets its own grid. Squares darken as you pass the daily target, so one glance tells you how the month actually went.",
  },
  {
    color: "amber",
    title: "Streaks that update as you go",
    body: "Current and longest streak sit on each card and recalculate the moment you check in, in every open tab at once.",
  },
  {
    color: "blue",
    title: "Works with the network off",
    body: "Install it once and it keeps working on a plane, in a basement, or on a connection that has given up.",
  },
  {
    color: "violet",
    title: "Backups you can hold",
    body: "Export every habit and check-in to a single JSON file, then import it on another machine. The file is yours.",
  },
];

const VIEWS: Array<{ span: string; name: string; body: string; visual: ReactNode }> = [
  {
    span: "1 day",
    name: "Today",
    body: "One row per habit. Tap or swipe to log today's check-in and clear the list.",
    visual: <MiniHeatmap columns={1} color="emerald" seed={7} />,
  },
  {
    span: "84 days",
    name: "Week",
    body: "The last twelve weeks side by side, where a slipping cadence shows up early.",
    visual: <MiniHeatmap columns={12} color="blue" seed={19} />,
  },
  {
    span: "365 days",
    name: "Overall",
    body: "January 1 through today, the whole year in a single grid per habit.",
    visual: <MiniHeatmap columns={53} color="violet" seed={41} />,
  },
  {
    span: "all time",
    name: "Stats",
    body: "Totals, week-over-week movement, a streak leaderboard, and the habits about to break.",
    visual: <MiniBars color="amber" />,
  },
];

const INSTALL_STEPS = [
  "Open habits in Chrome, Edge, or Safari.",
  "Choose Install from the address bar, or Share, then Add to Home Screen on iOS.",
  "Launch it from your dock or home screen. It opens offline with your data already there.",
];

const FAQ = [
  {
    question: "Where is my data stored?",
    answer:
      "In this browser's IndexedDB, under this site's origin. Clearing site data deletes it, so export a backup first.",
  },
  {
    question: "Does it sync between devices?",
    answer:
      "No. Move data yourself: export a backup on one device and import it on the other. Importing replaces what is currently stored.",
  },
  {
    question: "Do I need an account?",
    answer: "No. There is no sign-up, and no server to sign up to.",
  },
  {
    question: "Can I track something more than once a day?",
    answer:
      "Yes. Give the habit a daily target and log it as many times as you need. The square keeps darkening as you go past the target.",
  },
  {
    question: "What does it cost?",
    answer: "Nothing. Habits is MIT-licensed and the source is on GitHub.",
  },
];
