import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// --- MODULAR COMPONENTS ---
const CTAHeader = ({ children }) => (
    <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
        {children}
    </h2>
);

const CTADescription = ({ children }) => (
    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
        {children}
    </p>
);

const CTAButtons = () => (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" asChild className="rounded-lg px-8 py-3 text-base font-medium transition-colors">
            <Link to="/auth">Start Free Practice <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
    </div>
);

const CTAAssuranceText = ({ children }) => (
    <p className="text-sm mt-4 text-gray-500">
        {children}
    </p>
);

// --- MAIN COMPONENT ---
const SignupCTA = () => (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gray-50">
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