import { useTheme } from "next-themes";
import Image from "next/image";

export const ProductPreview = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Visual Workflow Orchestration
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Design, monitor, and scale AI workflows through a powerful visual
            interface built for developers.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">

          {/* Card */}
          <div className="relative rounded-3xl border border-border bg-card/70 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/40">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>

            {/* Dashboard image */}
            <div className="relative">
              <Image
                src={isDark ? "/main/dashboard-dark.png" : "/Logos/dashboard.png"}
                alt="OpenFlowX Dashboard Preview"
                width={1920}
                height={1080}
                priority
                className="w-full h-auto object-cover"
              />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
