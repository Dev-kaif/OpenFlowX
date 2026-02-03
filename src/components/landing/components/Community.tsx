import { Github, Users, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const highlights = [
  {
    icon: Github,
    title: "GitHub-First",
    description: "All development happens in the open. PRs welcome.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description: "Features prioritized by real user feedback.",
  },
  {
    icon: Map,
    title: "Transparent Roadmap",
    description: "See what's planned and influence direction.",
  },
];

export const Community = () => {
  return (
    <section id="community" className="py-24">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Open Source & Community
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            OpenFlowX is built in the open with a community of AI builders.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {highlights.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border bg-card/50 text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "linear-gradient(135deg, hsl(168 76% 42% / 0.15), hsl(156 68% 28% / 0.1))",
                  }}
                >
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            asChild
          >
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Image className="h-5 w-fit" height={10} width={10} alt="github" src={"/Logos/github.svg"} />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
