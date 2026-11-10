import { Schema, model, models, type Model, type Types } from "mongoose";
import { Event } from "./event.model";

/** Plain shape of a Booking document. */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pragmatic email check: local part, "@", domain with a TLD, no whitespace.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    // Reference (not embedding) keeps bookings independent of event size.
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // normalize so the same address always compares equal
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: "{VALUE} is not a valid email address",
      },
    },
  },
  { timestamps: true }, // manages createdAt / updatedAt automatically
);

// Ensure the referenced event exists before persisting (only when eventId is new/changed).
bookingSchema.pre("save", async function () {
  if (!this.isNew && !this.isModified("eventId")) return;

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event not found for eventId: ${this.eventId.toString()}`);
  }
});

// Reuse the compiled model across hot reloads to avoid OverwriteModelError.
export const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking> | undefined) ??
  model<IBooking>("Booking", bookingSchema);

export default Booking;
