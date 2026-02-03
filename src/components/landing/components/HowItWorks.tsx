import { Zap, Link, Send, Save } from "lucide-react";

const steps = [
  {
    icon: Zap,
    number: "01",
    title: "Choose a Trigger",
    description:
      "Start with an event: schedule, webhook, Stripe payment, or Telegram message.",
  },
  {
    icon: Link,
    number: "02",
    title: "Chain Models, APIs & Logic",
    description:
      "Combine LLMs, conditionals, transformations, and external services into a single workflow.",
  },
  {
    icon: Send,
    number: "03",
    title: "Deliver Results",
    description:
      "Route outputs to Slack, databases, files, emails, or any destination you control.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            How OpenFlowX Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple, predictable model for orchestrating AI workflows.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-20 left-[18%] right-[18%] h-px bg-linear-to-r from-primary/20 via-primary/60 to-primary/20" />

            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="relative inline-flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-linear-to-br from-[hsl(168,76%,42%)] via-[hsl(160,82%,35%)] to-[hsl(156,68%,28%)]">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="mt-2 text-xs font-mono text-muted-foreground">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Save-before-run rule */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4">
              <Save className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Save before execution
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Any changes to a workflow must be saved before execution.
                  Unsaved changes are not applied when a workflow runs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
