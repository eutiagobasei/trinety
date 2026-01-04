import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import trinityLogo from "@/assets/trinity-logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <img
            src={trinityLogo}
            alt="Trinity Hub"
            className="h-10 w-auto"
          />

          {/* CTA */}
          <Button
            variant={isScrolled ? "default" : "outline"}
            onClick={() => navigate("/auth")}
            className="transition-all duration-300"
          >
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
