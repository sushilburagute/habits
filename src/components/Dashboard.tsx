import { useAppContext } from "@/contexts/AppContext";
import { TodayView } from "@/components/views/TodayView";
import { WeekView } from "@/components/views/WeekView";
import { OverallView } from "@/components/views/OverallView";
import { StatsView } from "@/components/views/StatsView";

type DashboardProps = {
  onCreateRequest: () => void;
};

export function Dashboard({ onCreateRequest }: DashboardProps) {
  const {
    state: { route },
  } = useAppContext();

  const renderRoute = () => {
    const props = { onCreateRequest };
    switch (route) {
      case "week":
        return <WeekView {...props} />;
      case "overall":
        return <OverallView {...props} />;
      case "stats":
        return <StatsView {...props} />;
      case "today":
      default:
        return <TodayView {...props} />;
    }
  };

  return (
    <section className="space-y-6 py-10">
      {renderRoute()}
    </section>
  );
}
