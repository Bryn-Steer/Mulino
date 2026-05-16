const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const { people, date, time, name, phone, email } = req.body;

  if (!people || !date || !time || !name || !phone || !email) {
    return res.status(400).send("Missing required booking details");
  }

  try {
    const safePeople = escapeHtml(people);
    const safeDate = escapeHtml(date);
    const safeTime = escapeHtml(time);
    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(phone);
    const safeEmail = escapeHtml(email);

    await resend.emails.send({
      from: "Mulino Website <bookings@mulinomanchester.co.uk>",
      to: ["mulinomanchester@gmail.com"],
      reply_to: safeEmail,
      subject: "New Table Booking Request - Mulino Manchester",
      html: `
        <h2>New Table Booking Request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>People:</strong> ${safePeople}</p>
        <p><strong>Date:</strong> ${safeDate}</p>
        <p><strong>Time:</strong> ${safeTime}</p>
      `,
    });

    return res.redirect(303, "/thank-you.html");
  } catch (error) {
    console.error("Reservation form error:", error);
    return res.status(500).send("There was a problem sending the reservation request.");
  }
};