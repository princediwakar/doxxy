import Link from "next/link"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// --- MODULAR COMPONENTS ---
interface CTAProps {
  children: React.ReactNode;
}

const CTAHeader = ({ children }: CTAProps) => (
    <h2 className="text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight">
        {children}
    </h2>
);

const CTADescription = ({ children }: CTAProps) => (
    <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
        {children}
    </p>
);

const CTAButtons = () => (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild className="rounded-lg px-8 py-3 text-base font-medium transition-colors">
            <Link href="/auth">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
    </div>
);

const CTAAssuranceText = ({ children }: CTAProps) => (
    <p className="text-sm mt-4 text-muted-foreground">
        {children}
    </p>
);

// --- MAIN COMPONENT ---
const SignupCTA = () => (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
            <CTAHeader>
                Ready to Get Started?
            </CTAHeader>
            <CTADescription>
                Join thousands of healthcare professionals who have transformed their practice with Doxxy.
                Get started for free with our Practice Essentials plan.
            </CTADescription>
            <CTAButtons />
            <CTAAssuranceText>
                No setup fees • Cancel anytime • 24/7 support included
            </CTAAssuranceText>
        </div>
    </section>
);

export default SignupCTA;