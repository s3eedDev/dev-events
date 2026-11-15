import { NextResponse, type NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event, { type IEvent } from "@/database/event.model";

/** Route context: in this Next.js version `params` is a Promise. */
interface RouteContext {
  params: Promise<{ slug: string }>;
}

/** Response bodies, so clients get a consistent, typed shape. */
type EventSuccess = { message: string; event: IEvent };
type EventError = { message: string };

/** Slugs are lowercase alphanumerics separated by single hyphens (matches the model's slugify). */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 200;

/**
 * Normalizes and validates a raw slug param.
 * Returns the clean slug, or null if it is missing/malformed.
 */
function parseSlug(raw: string | undefined): string | null {
  if (typeof raw !== "string") return null;
  const slug = raw.trim().toLowerCase();
  if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) return null;
  return slug;
}

/** GET /api/events/[slug] — returns a single event by its slug. */
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<EventSuccess | EventError>> {
  try {
    const { slug: rawSlug } = await params;

    // Validate before touching the database (also blocks query-operator injection).
    const slug = parseSlug(rawSlug);
    if (!slug) {
      return NextResponse.json(
        { message: "A valid event slug is required (lowercase letters, numbers and hyphens)." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // lean() returns a plain object, which is cheaper and JSON-safe.
    const event = await Event.findOne({ slug }).lean<IEvent>().exec();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${slug}" was not found.` },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Event fetched successfully", event }, { status: 200 });
  } catch (error) {
    // Log details server-side only; never leak internals to the client.
    console.error("GET /api/events/[slug] failed:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while fetching the event." },
      { status: 500 },
    );
  }
}
