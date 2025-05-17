import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestChordScraper from "@/components/TestChordScraper";

const TestPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4">
        <TestChordScraper />
      </main>
      <Footer />
    </div>
  );
};

export default TestPage;
