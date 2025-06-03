import { title } from "@/components/primitives";
import MainLayout from "@/layouts/main";

export default function DashboardPage() {
  return (
    <MainLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Timer</h1>
        </div>
      </section>
    </MainLayout>
  );
}
