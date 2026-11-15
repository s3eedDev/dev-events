"use client";

import { useState } from "react"
import { createBooking } from "@/lib/actions/booking.actions";

const BookEvent = ({ eventId }: { eventId: string }) => {

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        setError('');
        try {
            const result = await createBooking(eventId, email);
            if (result.success) setSubmitted(true);
            else setError(result.message);
        } catch {
            setError('Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank You for signing up !</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                        type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        required
                        placeholder="Enter Your Email Address"/>
                    </div>

                    {error && <p className="text-sm" role="alert">{error}</p>}

                    <button type="submit" className="button-submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
