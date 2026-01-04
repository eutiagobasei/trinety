import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "Eu achava que só grandes empresas faziam planejamento estratégico. O Trinity mudou totalmente minha visão — agora tenho clareza e minha equipe trabalha focada.",
    name: "Patrícia",
    role: "Fundadora",
    company: "Loja de cosméticos natural",
  },
  {
    quote: "Antes era tudo no papel, perdido. Hoje sei o que cada área tem que fazer por semana. E o melhor: consigo medir o crescimento.",
    name: "Rafael",
    role: "Gestor",
    company: "Distribuidora B2B",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-success/20 text-success text-sm font-semibold mb-4">
              🗣️ PROVAS SOCIAIS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              O que dizem nossos clientes
            </h2>
          </div>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-muted/30 border-border overflow-hidden"
              >
                <CardContent className="p-8 relative">
                  {/* Quote icon */}
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Quote className="w-6 h-6 text-primary" />
                  </div>
                  
                  {/* Quote text */}
                  <p className="text-lg text-foreground mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
