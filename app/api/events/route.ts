import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary} from 'cloudinary';
import connectToDatabase from "@/lib/mongodb";
import Event from "@/database/event.model";


export async function POST(req: NextRequest){
    try{
        await connectToDatabase();

        const formData = await req.formData();

        let event;

        try{
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({message: "Invalid JSON data format"}, {status: 400})
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({message: "Image file is required"}, {status: 400})
        
        let tags: string[];
        let agenda: string[];
        try {
            tags = JSON.parse(formData.get('tags') as string);
            agenda = JSON.parse(formData.get('agenda') as string);
        } catch {
            return NextResponse.json({message: "Tags and agenda must be valid JSON arrays"}, {status: 400})
        }

        // Validate required fields before uploading, so invalid input never creates an asset.
        const validationError = new Event({
            ...event,
            image: "pending-upload",
            tags,
            agenda,
        }).validateSync();
        if (validationError) {
            return NextResponse.json({message: "Invalid event data"}, {status: 400})
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent'}, (error, results) => {
            if(error || !results) return reject(error ?? new Error("Upload failed"));
                resolve(results);
            }).end(buffer)
        })

        event.image = uploadResult.secure_url;

        try {
            const createdEvent = await Event.create({
                ...event,
                tags: tags,
                agenda: agenda,
            });

            return NextResponse.json({message: "Event created successfully ", event: createdEvent}, {status: 201})
        } catch (createError) {
            // Don't leave an orphaned image behind when persistence fails.
            await cloudinary.uploader.destroy(uploadResult.public_id).catch((destroyError: unknown) => {
                console.error("Failed to clean up Cloudinary asset:", destroyError);
            });
            throw createError;
        }

    } catch (e) {
        console.error("POST /api/events failed:", e);
        return NextResponse.json({message: "Event creation failed"}, {status: 500})
    }
}

export async function GET() {
    try{
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1});

        return NextResponse.json({message: "Event fetched successfully", events }, {status: 200})

    } catch (e) {
        console.error("GET /api/events failed:", e);
        return NextResponse.json({message: "Event fetching failed"}, {status: 500})
    }
}