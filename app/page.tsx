import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Process from "@/components/Process";
import Projects from "@/components/Projects";
import Team from "@/components/Team";

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <Hero />
      <Projects />
      <Process />
      <Team />
    </main>
  );
}
