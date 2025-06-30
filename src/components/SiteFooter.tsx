import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="py-12 px-4 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/logo.svg" alt="Doxxy" className="w-24" />
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Doxxy is the modern healthcare management platform designed specifically for small to medium clinics, 
              empowering them to deliver exceptional patient care efficiently and securely.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 7388890554</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>doxxyapp@gmail.com</span>
              </div>
            </div>
            
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <div className="space-y-2">
              <Link to="/features" className="block text-muted-foreground hover:text-primary transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/comparisons" className="block text-muted-foreground hover:text-primary transition-colors">
                Doxxy vs Others
              </Link>
              
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <div className="space-y-2">
              
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link to="/faq" className="block text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/security" className="block text-muted-foreground hover:text-primary transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Doxxy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter; 