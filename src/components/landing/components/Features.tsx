import { Layers, Zap, GitBranch, Send } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-Model Orchestration",
    description: "Connect OpenAI, Anthropic, Gemini, DeepSeek, xAI, and OpenRouter in a single workflow.",
  },
  {
    icon: Zap,
    title: "Event-Driven Execution",
    description: "Trigger workflows from Stripe, Telegram, Schedules, Webhooks, and more.",
  },
  {
    icon: GitBranch,
    title: "Full Logic Control",
    description: "Build complex flows with IF/ELSE conditions, delays, code nodes, and templates.",
  },
  {
    icon: Send,
    title: "Real Outputs",
    description: "Deliver results to Slack, Discord, Email, Files, databases, and storage systems.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Built for AI Builders
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to orchestrate AI workflows at scale.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: "linear-gradient(135deg, hsl(168 76% 42% / 0.15), hsl(156 68% 28% / 0.1))",
                  }}
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
