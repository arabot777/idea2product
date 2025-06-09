import Navbar from "@/components/navbar"

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <section className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      {children}
    </section>
  );
}
