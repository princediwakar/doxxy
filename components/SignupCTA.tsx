import Link from "next/link"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const DEFAULT_CTA_BUTTON_HREF = "/auth";
const WHATSAPP_CHAT_URL = "https://wa.me/917388890554?text=Hi%21%20I%27d%20like%20to%20know%20more%20about%20Doxxy";

interface SignupCTAProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  assurance?: string;
}

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

const CTAButtons = ({ children }: CTAProps) => (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {children}
    </div>
);

const CTAAssuranceText = ({ children }: CTAProps) => (
    <p className="text-sm mt-4 text-muted-foreground">
        {children}
    </p>
);

// --- MAIN COMPONENT ---
const SignupCTA = ({
  heading = "Ready to Get Started?",
  description = "Join thousands of healthcare professionals who have transformed their practice with Doxxy. Get started for free with our Practice Essentials plan.",
  buttonText = "Start Free Practice",
  buttonHref = DEFAULT_CTA_BUTTON_HREF,
  assurance = "First 100 consultations free • ₹10/consultation after • Cancel anytime",
}: SignupCTAProps) => (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
            <CTAHeader>
                {heading}
            </CTAHeader>
            <CTADescription>
                {description}
            </CTADescription>
            <CTAButtons>
                <Button size="lg" asChild className="rounded-lg px-8 py-3 text-base font-medium transition-colors">
                    <Link href={buttonHref}>{buttonText} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="rounded-lg px-8 py-3 text-base font-medium transition-colors">
                    <a href={WHATSAPP_CHAT_URL} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
                </Button>
            </CTAButtons>
            <CTAAssuranceText>
                {assurance}
            </CTAAssuranceText>
        </div>
    </section>
);

export default SignupCTA;
export { DEFAULT_CTA_BUTTON_HREF };