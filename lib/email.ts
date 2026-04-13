import { Resend } from 'resend'
import QRCode from 'qrcode'

export async function sendEventReminderEmail({
  to,
  buyerName,
  eventTitle,
  eventDate,
  eventLocation,
  eventId,
  orderId,
}: {
  to: string
  buyerName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventId: string
  orderId: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  const ticketUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/ticket/${orderId}`
  const eventUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${eventId}`

  await resend.emails.send({
    from: 'Eventopia <onboarding@resend.dev>',
    to,
    subject: `⏰ Reminder: "${eventTitle}" is tomorrow!`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>
  body { font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 540px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #818CF8, #6366f1); padding: 32px; text-align: center; color: white; }
  .body { padding: 32px; }
  .detail { display: flex; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
  .label { color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .btn { display: inline-block; background: #6366f1; color: white !important; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 24px; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size:40px;margin-bottom:8px">⏰</div>
      <h1 style="margin:0;font-size:22px">See you tomorrow!</h1>
      <p style="margin:8px 0 0;opacity:0.85;font-size:14px">Your event is just around the corner</p>
    </div>
    <div class="body">
      <p style="font-size:16px;color:#1f2937;margin-top:0">Hey ${buyerName}!</p>
      <p style="color:#6b7280;font-size:14px">This is a friendly reminder that <strong>${eventTitle}</strong> is happening tomorrow. Get ready!</p>

      <div style="background:#f8f7ff;border-radius:12px;padding:20px;margin:20px 0">
        <div class="detail"><span class="label" style="min-width:80px">📅 Date</span> ${eventDate}</div>
        <div class="detail" style="border:none"><span class="label" style="min-width:80px">📍 Location</span> ${eventLocation}</div>
      </div>

      <a href="${ticketUrl}" class="btn">View My Ticket →</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Eventopia · <a href="${eventUrl}" style="color:#818CF8">View Event</a></div>
  </div>
</body>
</html>`,
  })
}

export async function sendWaitlistNotificationEmail({
  to,
  firstName,
  eventTitle,
  eventId,
}: {
  to: string
  firstName: string
  eventTitle: string
  eventId: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const eventUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/events/${eventId}`

  await resend.emails.send({
    from: 'Eventopia <onboarding@resend.dev>',
    to,
    subject: `🎟 A spot just opened up for ${eventTitle}!`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>
  body { font-family: -apple-system, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 540px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #818CF8, #6366f1); padding: 32px; text-align: center; color: white; }
  .body { padding: 32px; }
  .btn { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 20px; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>🎉 Good news, ${firstName}!</h1></div>
    <div class="body">
      <p style="font-size:16px;color:#1f2937;">A spot just opened up for <strong>${eventTitle}</strong>.</p>
      <p style="color:#6b7280;">You were on the waitlist — grab your ticket before it's gone!</p>
      <a href="${eventUrl}" class="btn">Get My Ticket →</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Eventopia</div>
  </div>
</body>
</html>`,
  })
}

type SendTicketEmailParams = {
  to: string
  buyerName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  orderId: string
  totalAmount: string
  isFree: boolean
}

export async function sendTicketConfirmationEmail(params: SendTicketEmailParams) {
  const { to, buyerName, eventTitle, eventDate, eventLocation, orderId, totalAmount, isFree } = params

  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — skipping email')
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Generate QR code as base64 image
  const ticketUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/ticket/${orderId}`
  const qrCodeDataUrl = await QRCode.toDataURL(ticketUrl, {
    width: 200,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' },
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #818CF8, #6366f1); padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; color: #1f2937; font-weight: 600; margin-bottom: 8px; }
    .subtext { color: #6b7280; font-size: 14px; margin-bottom: 28px; }
    .ticket { background: #f8f7ff; border: 2px dashed #818CF8; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .ticket-title { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 16px; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9e7ff; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 13px; color: #6b7280; font-weight: 500; }
    .detail-value { font-size: 13px; color: #1f2937; font-weight: 600; text-align: right; max-width: 60%; }
    .qr-section { text-align: center; padding: 24px; background: #f9fafb; border-radius: 12px; margin-bottom: 24px; }
    .qr-section img { border-radius: 8px; border: 3px solid #818CF8; padding: 8px; background: white; }
    .qr-label { font-size: 13px; color: #6b7280; margin-top: 12px; }
    .order-id { font-size: 11px; color: #818CF8; font-family: monospace; margin-top: 4px; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; }
    .footer a { color: #818CF8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎟 Eventopia</h1>
      <p>Your ticket is confirmed!</p>
    </div>
    <div class="body">
      <p class="greeting">Hey ${buyerName}! 🎉</p>
      <p class="subtext">Your registration is confirmed. Here's your ticket for the event below.</p>

      <div class="badge">✓ Payment ${isFree ? 'Free' : 'Confirmed'}</div>

      <div class="ticket">
        <div class="ticket-title">${eventTitle}</div>
        <div class="detail-row">
          <span class="detail-label">📅 Date & Time</span>
          <span class="detail-value">${eventDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Location</span>
          <span class="detail-value">${eventLocation}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💳 Amount Paid</span>
          <span class="detail-value">${isFree ? 'Free' : `$${totalAmount}`}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🎫 Order ID</span>
          <span class="detail-value" style="font-family: monospace; font-size: 11px;">${orderId}</span>
        </div>
      </div>

      <div class="qr-section">
        <img src="${qrCodeDataUrl}" width="160" height="160" alt="QR Code"/>
        <p class="qr-label">Show this QR code at the event entrance</p>
        <p class="order-id">${orderId}</p>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center;">
        Have questions? Visit <a href="${process.env.NEXT_PUBLIC_SERVER_URL}" style="color: #818CF8;">Eventopia</a> or reply to this email.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Eventopia · <a href="${process.env.NEXT_PUBLIC_SERVER_URL}">eventopia.com</a></p>
    </div>
  </div>
</body>
</html>
  `

  await resend.emails.send({
    from: 'Eventopia <onboarding@resend.dev>',
    to,
    subject: `🎟 Your ticket for ${eventTitle}`,
    html,
  })
}
