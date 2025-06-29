import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const SignupCTA = () => (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
                Join thousands of healthcare professionals who have transformed their practice with Doxxy.
                Get started for free with our Practice Essentials plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                    <Link to="/auth">Start Free Practice</Link>
                </Button>
                {/* <Button size="lg" variant="outline" className="text-blue-600">
                    Schedule a Demo
                </Button> */}
            </div>
            <p className="text-sm mt-4 opacity-75">
                No setup fees • Cancel anytime • 24/7 support included
            </p>
        </div>
    </section>

);

export default SignupCTA; 