import Hero from "../sections/Hero";
import About from "../sections/About";
import Destinations from "../sections/Destinations";
import Accommodation from "../sections/Accommodation";
import Amenities from "../sections/Amenities";
import FarmToTable from "../sections/FarmToTable";
import WorkAndUnwind from "../sections/WorkAndUnwind";
import Packages from "../sections/Packages";
import Features from "../sections/Features";
import GalleryPreview from "../sections/GalleryPreview";
import StoriesMoments from "../sections/StoriesMoments";
import Testimonials from "../sections/Testimonials";
import CTABanner from "../sections/CTABanner";

export default function Home({ onOpenBooking }) {
  return (
    <>
      <Hero onOpenBooking={onOpenBooking} />
      <About />
      <Destinations />
      <Accommodation />
      <Amenities />
      <FarmToTable />
      <WorkAndUnwind />
      <Packages onEnquire={onOpenBooking} />
      <Features />
      <GalleryPreview />
      <StoriesMoments />
      <Testimonials />
      <CTABanner onOpenBooking={onOpenBooking} />
    </>
  );
}
