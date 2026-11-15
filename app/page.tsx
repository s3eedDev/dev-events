import { SeverityNumber } from "@opentelemetry/api-logs";
import { after } from "next/server";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { posthogLoggerProvider } from "@/instrumentation";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";


const eventCatalogLogger = posthogLoggerProvider?.getLogger("posthog-event-catalog");

const BASE_URL= process.env.NEXT_PUBLIC_BASE_URL;
const Page = async () => { 
    'use cache';
cacheLife('hours')

    const response = await fetch(`${BASE_URL}/api/events`);
    if (!response.ok) {
        throw new Error(`Failed to fetch events (status ${response.status})`);
    }
    const events: IEvent[] = (await response.json()).events ?? [];

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
                    {events && events.length > 0 && events.map((event: IEvent) => (
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
