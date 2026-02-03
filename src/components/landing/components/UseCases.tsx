import { CreditCard, Search, MessageCircle, Workflow } from "lucide-react";

const useCases = [
  {
    icon: CreditCard,
    title: "AI Agents on Stripe Events",
    description: "Trigger intelligent workflows when payments succeed, fail, or subscriptions change. Route to different LLMs based on customer tier.",
  },
  {
    icon: Search,
    title: "Multi-LLM Research Pipelines",
    description: "Chain Claude for analysis, GPT-4 for summarization, and Gemini for translation. Compare outputs and pick the best result.",
  },
  {
    icon: MessageCircle,
    title: "Chatbots with Memory & Logic",
    description: "Build conversational AI with persistent memory, conditional responses, and multi-turn reasoning across different models.",
  },
  {
    icon: Workflow,
    title: "Automated Scraping + AI Analysis",
    description: "Schedule web scraping, process with AI for insights, and deliver structured reports to Slack or databases.",
  },
];

export const UseCases = () => {
  return (
    <section id="use-cases" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Real-World Use Cases
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how teams are using OpenFlowX to build production AI systems.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-300"
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 rounded-xl bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative flex gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(168 76% 42% / 0.15), hsl(156 68% 28% / 0.1))",
                  }}
                >
                  <useCase.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
