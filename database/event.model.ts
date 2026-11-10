import { Schema, model, models, type Model } from "mongoose";

/** Plain shape of an Event document. */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Reusable validator: string array must contain at least one non-empty item. */
const nonEmptyStringArray = {
  validator: (value: string[]): boolean =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => item.trim().length > 0),
  message: "{PATH} must contain at least one non-empty item",
};

/** Required, trimmed string field (empty strings are rejected by `required`). */
const requiredString = { type: String, required: true, trim: true } as const;

const eventSchema = new Schema<IEvent>(
  {
    title: requiredString,
    // Generated in the pre-save hook; `unique` creates the unique index.
    slug: { type: String, unique: true, trim: true, lowercase: true },
    description: requiredString,
    overview: requiredString,
    image: requiredString,
    venue: requiredString,
    location: requiredString,
    date: requiredString,
    time: requiredString,
    mode: requiredString,
    audience: requiredString,
    agenda: { type: [String], required: true, validate: nonEmptyStringArray },
    organizer: requiredString,
    tags: { type: [String], required: true, validate: nonEmptyStringArray },
  },
  { timestamps: true }, // manages createdAt / updatedAt automatically
);

/** Converts a title into a URL-friendly slug, e.g. "Next.js Conf 2025!" -> "next-js-conf-2025". */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "-") // collapse non-alphanumerics into hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/** Normalizes a parseable date string to ISO calendar format (YYYY-MM-DD). */
function normalizeDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: "${value}"`);
  }
  return parsed.toISOString().slice(0, 10);
}

/** Normalizes "9:05", "9:05 AM" or "21:05" to 24-hour "HH:MM". */
function normalizeTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time: "${value}" (expected HH:MM or h:mm AM/PM)`);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();

  if (meridiem) {
    if (hours < 1 || hours > 12) throw new Error(`Invalid time: "${value}"`);
    if (meridiem === "pm" && hours !== 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }
  if (hours > 23 || minutes > 59) throw new Error(`Invalid time: "${value}"`);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

eventSchema.pre("save", function () {
  // Regenerate the slug only for new documents or when the title changed.
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title);
    if (!this.slug) throw new Error("Title must contain alphanumeric characters");
  }

  if (this.isModified("date")) this.date = normalizeDate(this.date);
  if (this.isModified("time")) this.time = normalizeTime(this.time);
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError.
export const Event: Model<IEvent> =
  (models.Event as Model<IEvent> | undefined) ?? model<IEvent>("Event", eventSchema);

export default Event;
