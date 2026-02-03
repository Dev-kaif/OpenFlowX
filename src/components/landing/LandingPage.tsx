import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProductPreview } from "./components/ProductPreview";
import { Features } from "./components/Features";
import { Integrations } from "./components/Integrations";
import { HowItWorks } from "./components/HowItWorks";
import { UseCases } from "./components/UseCases";
import { Community } from "./components/Community";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";

const LandingPage = () => {
    return (
        <div className="landing min-h-screen bg-background">
            <Header />
            <main>
                <Hero />
                <ProductPreview />
                <Features />
                <Integrations />
                <HowItWorks />
                <UseCases />
                <Community />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
