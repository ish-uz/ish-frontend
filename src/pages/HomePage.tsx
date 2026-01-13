import { Header, Footer } from '@/components';
import {
  HeroSection,
  MainBlocks,
  StatsSection,
  TrustSection,
  MobileSection,
} from '@/features/landing/components';

export function HomePage() {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <HeroSection />
      <MainBlocks />
      <StatsSection />
      <TrustSection />
      <MobileSection />
      <Footer />
    </div>
  );
}
