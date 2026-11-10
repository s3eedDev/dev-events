import { SeverityNumber } from "@opentelemetry/api-logs";
import { after } from "next/server";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { posthogLoggerProvider } from "@/instrumentation";
import {events} from "@/lib/constants";

const eventCatalogLogger = posthogLoggerProvider?.getLogger("posthog-event-catalog");

const Page = () => {
    after(() => {
        eventCatalogLogger?.emit({
            body: "event_catalog_rendered",
            severityNumber: SeverityNumber.INFO,
            attributes: {
                page: "/",
                event_count: events.length,
            },
        });
    });

    return (
        <section>
            <h1 className="text-center">The HUB for Every Dev <br/> Event You can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn/>

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                <ul className="events">
                    {events.map((event) => (
                        <li key={event.title}>
                        <EventCard {...event}/>
                        </li>
                    ))}
                </ul>
            </div>

        </section>
    )
}
export default Page
