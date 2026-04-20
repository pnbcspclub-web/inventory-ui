import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { fullName, email, company, locations, notes } = await req.json();

    if (!fullName || !email) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }

    const subject = `New Demo Request from ${fullName}`;
    const text = `
      Name: ${fullName}
      Email: ${email}
      Company: ${company || "N/A"}
      Locations: ${locations || "N/A"}
      Notes: ${notes || "No additional notes"}
    `;
    const html = `
      <h2>New Demo Request</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || "N/A"}</p>
      <p><strong>Locations:</strong> ${locations || "N/A"}</p>
      <p><strong>Notes:</strong><br>${notes || "No additional notes"}</p>
    `;

    await sendEmail({
      to: process.env.CONTACT_EMAIL || "admin@inventagrow.com",
      subject,
      text,
      html,
    });

    return NextResponse.json({ message: "Demo request sent successfully" });
  } catch (error: any) {
    console.error("Error sending demo request email:", error);
    return NextResponse.json(
      { message: "Failed to send demo request", error: error.message },
      { status: 500 }
    );
  }
}
