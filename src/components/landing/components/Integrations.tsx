import { executionNodes, triggerNodes, utilNodes } from "@/components/reactFlow/nodeSelector";
import { NodeIconRenderer } from "@/lib/icon";

const landingIntegrationGroups = [
  {
    title: "Triggers",
    nodes: triggerNodes,
  },
  {
    title: "LLMs & Execution",
    nodes: executionNodes.filter(n =>
      [
        "OPENAI",
        "ANTHROPIC",
        "GEMINI",
        "DEEPSEEK",
        "XAI",
        "OPENROUTER",
      ].includes(n.type)
    ),
  },
  {
    title: "Logic",
    nodes: utilNodes.filter(n =>
      ["IFELSE", "DELAY", "CODE", "TEMPLATE", "JSON_PARSE"].includes(n.type)
    ),
  },
  {
    title: "Storage & Outputs",
    nodes: executionNodes.filter(n =>
      [
        "POSTGRESS",
        "GOOGLESHEETS",
        "S3",
        "R2",
        "SLACK",
        "DISCORD",
        "TELEGRAM",
        "EMAIL_RESEND",
      ].includes(n.type)
    ),
  },
];

export const Integrations = () => {
  return (
    <section id="integrations" className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Supported Nodes & Integrations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use the same nodes in production that you see here.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {landingIntegrationGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                {group.title}
              </h3>

              <div className="space-y-2">
                {group.nodes.map((node) => (
                  <div
                    key={node.type}
                    className="flex items-center gap-3 p-3 rounded-lg
                               border border-border bg-card/50
                               hover:border-primary/30 hover:bg-card
                               transition-all duration-200 group"
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center
                                 bg-muted group-hover:bg-primary/10 transition-colors"
                    >
                      <NodeIconRenderer
                        icon={node.icon}
                        className="w-4 h-4 text-muted-foreground group-hover:text-primary"
                      />
                    </div>

                    <span className="text-sm font-medium">
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


