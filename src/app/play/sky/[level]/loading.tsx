import { Loader } from "@/components/ui/loader";
import { getDictionary } from "@/lib/locale";

/** A game on its way: shown the moment it is tapped (the route is dynamic —
    without this the tap waited on the server with nothing to show). */
export default async function GameLoading() {
  const dict = await getDictionary();
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <Loader label={dict.ui.loading} />
    </main>
  );
}
