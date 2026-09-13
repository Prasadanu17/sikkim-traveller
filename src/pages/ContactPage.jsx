import { Mail, Phone, MapPin } from "lucide-react";
import EnquiryForm from "../components/EnquiryForm";

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 bg-parchment min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <p className="elevation-tag mb-4 text-crimson">Contact</p>
        <h1 className="font-display text-4xl text-ink mb-4">Let's talk trip logistics</h1>
        <p className="text-ink/60 max-w-md mb-14">
          Real answers from our Gangtok office — not a call center reading a script.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14">
          <div className="lg:col-span-3 bg-white/50 rounded-2xl p-8 border border-ink/10">
            <EnquiryForm />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-crimson mt-1 shrink-0" />
              <div>
                <p className="font-display text-lg text-ink">Office</p>
                <p className="text-sm text-ink/60">
                  Tibet Road, Development Area, Gangtok, East Sikkim 737101
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-crimson mt-1 shrink-0" />
              <div>
                <p className="font-display text-lg text-ink">Phone</p>
                <p className="text-sm text-ink/60">+91 98XXX XXXXX (9am–7pm IST)</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail size={20} className="text-crimson mt-1 shrink-0" />
              <div>
                <p className="font-display text-lg text-ink">Email</p>
                <p className="text-sm text-ink/60">hello@sikkimtraveller.com</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-64 border border-ink/10">
              <iframe
                title="Gangtok office map"
                src="https://maps.google.com/maps?q=Gangtok,Sikkim&z=13&output=embed"
                className="w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
