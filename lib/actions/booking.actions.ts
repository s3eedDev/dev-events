"use server";

import { isValidObjectId } from "mongoose";
import Booking from "@/database/booking.model";
import connectToDatabase from "@/lib/mongodb";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BookingResult = { success: true } | { success: false; message: string };

/** Creates a booking for an event after validating the event id and email. */
export const createBooking = async (eventId: string, email: string): Promise<BookingResult> => {
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return { success: false, message: "A valid email address is required." };
    }
    if (typeof eventId !== "string" || !isValidObjectId(eventId)) {
        return { success: false, message: "Invalid event." };
    }

    try {
        await connectToDatabase();
        await Booking.create({ eventId, email: cleanEmail });
        return { success: true };
    } catch (error) {
        console.error("createBooking failed:", error);
        return { success: false, message: "Booking failed. Please try again." };
    }
};
