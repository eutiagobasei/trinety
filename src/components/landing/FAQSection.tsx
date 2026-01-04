import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso ter experiência com planejamento?",
    answer: "Não. O Trinity foi feito pra facilitar — até pra quem nunca fez um plano estratégico antes.",
  },
  {
    question: "Serve pra qualquer tipo de empresa?",
    answer: "Sim. Já é usado por empresas de comércio, serviços, indústria, saúde e tecnologia.",
  },
  {
    question: "Posso usar com minha equipe?",
    answer: "Sim. Você pode adicionar membros e delegar tarefas diretamente pela plataforma.",
  },
  {
    question: "É caro?",
    answer: "Pelo contrário. Custa menos que um cafezinho por dia. E o retorno é clareza, crescimento e menos estresse.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-semibold mb-4">
              ❓ DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Perguntas Frequentes
            </h2>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-card hover:bg-muted/50 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
