import { WhatsAppIcon } from "@/components/icons";
import { whatsappUrl } from "@/data/site";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl("Hello Urban Men, I have a question.")}
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 md:bottom-5 md:right-5 z-55 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#fff] shadow-xl transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
