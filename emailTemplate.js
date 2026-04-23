function birthdayEmailHTML(username) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#0a0a0a; font-family:'Helvetica Neue',Arial,sans-serif; }
    .wrap { max-width:560px; margin:40px auto; background:#111; border-radius:12px; overflow:hidden; border:1px solid #222; }
    .hero { background:#0f0f0f; padding:40px 32px 28px; text-align:center; border-bottom:1px solid #222; }
    .hero .icon { font-size:48px; display:block; margin-bottom:14px; }
    .hero h1 { margin:0 0 6px; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.5px; }
    .hero .sub { margin:0; color:#666; font-size:13px; }
    .hero .badge { display:inline-block; margin-top:12px; background:#6c63ff; color:#fff; font-size:11px; font-weight:600; padding:4px 14px; border-radius:20px; letter-spacing:0.04em; }
    .body { padding:32px; }
    .body p { color:#aaa; font-size:15px; line-height:1.75; margin:0 0 16px; }
    .body .name { color:#6c63ff; font-weight:600; }
    .quote { background:#1a1a1a; border-left:3px solid #6c63ff; border-radius:0 8px 8px 0; padding:16px 20px; margin:24px 0; color:#888; font-size:14px; line-height:1.8; }
    .footer { text-align:center; padding:20px 32px; background:#0d0d0d; border-top:1px solid #1e1e1e; }
    .footer p { margin:0; color:#444; font-size:11px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <span class="icon">🎂</span>
      <h1>Happy Birthday!</h1>
      <p class="sub">A special message just for you</p>
      <span class="badge">Today is your day</span>
    </div>
    <div class="body">
      <p>Dear <span class="name">${username}</span>,</p>
      <p>On this special day, we want you to know just how much you mean to us. Thank you for being part of our journey, Your continued trust and support means the world.</p>
      <div class="quote">
        🌟 May this birthday bring you everything you've been hoping for joy, good health, success, and all the wonderful things you deserve. Here's to celebrating YOU! 🎉
      </div>
      <p>Wishing you a fantastic day filled with laughter and love.</p>
      <p>Warmly,<br/><strong style="color:#e0e0e0">The Team</strong></p>
    </div>
    <div class="footer">
      <p>You're receiving this because you're a valued member of our community.</p>
    </div>
  </div>
</body>
</html>`;
}

module.exports = birthdayEmailHTML;